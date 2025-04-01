package com.Chess.Handler;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Nonnull;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class ChessWebSocketHandler extends TextWebSocketHandler {
    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private static final ObjectMapper objectMapper = new ObjectMapper(); // JSON Converter
    private static final RestTemplate restTemplate = new RestTemplate();

    private static final Map<WebSocketSession, String> sessionToPlayer = new ConcurrentHashMap<>();
    private static final Set<String> onlinePlayers = ConcurrentHashMap.newKeySet(); // Active players list
    private static final Set<String> matchedPlayers = ConcurrentHashMap.newKeySet(); // Players in an active match

    @Override
    public void afterConnectionEstablished(@Nonnull WebSocketSession session) {
        sessions.add(session);
        System.out.println("Player Connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(@Nonnull WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("Message Received: " + message.getPayload());

        try {
            Map<String, Object> requestData = objectMapper.readValue(message.getPayload(), new TypeReference<>() {});

            if (!requestData.containsKey("type")) {
                System.err.println("Invalid message format: missing 'type'");
                return;
            }

            String type = (String) requestData.get("type");

            switch (type) {
                case "join":
                    handleJoin(session, requestData);
                    break;

                case "leave":
                    handleLeave(session, requestData);
                    break;

                case "findPlayer":
                    handleMatchmaking(session);
                    break;

                case "move":
                    handleMove(session, requestData);
                    break;

                case "gameOver":
                    handleGameOver(requestData);
                    break;

                default:
                    System.err.println("Unknown message type: " + type);
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + message.getPayload());
            e.printStackTrace();
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, Object> requestData) throws IOException {
        String username = (String) requestData.get("username");
        if (username == null || username.isBlank()) {
            return;
        }

        sessionToPlayer.put(session, username);
        onlinePlayers.add(username);
        broadcastOnlinePlayers();
    }

    private void handleLeave(WebSocketSession session, Map<String, Object> requestData) throws IOException {
        String username = sessionToPlayer.get(session);
        if (username != null) {
            onlinePlayers.remove(username);
            matchedPlayers.remove(username);
            sessionToPlayer.remove(session);
            broadcastOnlinePlayers();
        }
    }

    private void handleMatchmaking(WebSocketSession session) throws IOException {
        if (onlinePlayers.size() < 2) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "matchError",
                    "message", "Not enough players online"
            ))));
            return;
        }

        List<String> availablePlayers = new ArrayList<>(onlinePlayers);
        availablePlayers.removeAll(matchedPlayers);

        if (availablePlayers.size() < 2) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "matchError",
                    "message", "No available players for matchmaking"
            ))));
            return;
        }

        String player1 = availablePlayers.get(0);
        String player2 = availablePlayers.get(1);
        matchedPlayers.add(player1);
        matchedPlayers.add(player2);

        matchedPlayers.add(player1);
        matchedPlayers.add(player2);
        onlinePlayers.remove(player1);
        onlinePlayers.remove(player2);  // 🚀 Fix: Ensure players are removed from the online list

        Map<String, Object> matchInfo = Map.of(
                "type", "matchFound",
                "player1", player1,
                "player2", player2
        );

        sendToAllSessions(objectMapper.writeValueAsString(matchInfo));
    }

    private void handleMove(WebSocketSession session, Map<String, Object> requestData) throws IOException {

        Map<String, Object> response = Map.of(
                "type", "move",
                "message", "Player Move",
                "moveData", requestData
        );
        sendToAllSessions(objectMapper.writeValueAsString(response));
    }

    private void handleGameOver(Map<String, Object> requestData) throws IOException {
        String winnerEmail = (String) requestData.get("winnerEmail");
        String loserEmail = (String) requestData.get("loserEmail");
        if (winnerEmail == null || loserEmail == null) {
            System.err.println("Game Over event missing winner or loser email");
            return;
        }

        String url = "http://localhost:8080/api/users/updateRating";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> requestBody = Map.of("winnerEmail", winnerEmail, "loserEmail", loserEmail);
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                sendToAllSessions(objectMapper.writeValueAsString(Map.of("type", "gameOver", "message", "Game Over! Ratings Updated", "winnerEmail", winnerEmail, "loserEmail", loserEmail)));
            } else {
                System.err.println("Failed to update player ratings. Response: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Error updating ratings: " + e.getMessage());
        }
    }

    private void broadcastOnlinePlayers() throws IOException {
        Map<String, Object> response = Map.of(
                "type", "onlinePlayers",
                "players", onlinePlayers
        );
        sendToAllSessions(objectMapper.writeValueAsString(response));
    }

    private void sendToAllSessions(String jsonResponse) throws IOException {
        System.out.println("Broadcasting Message: " + jsonResponse);
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(jsonResponse));
                System.out.println("Sent to: " + s.getId());
            }else {
                System.out.println("Skipped closed session: " + s.getId());
            }
        }
    }

    @Override
    public void afterConnectionClosed(@Nonnull WebSocketSession session, @Nonnull org.springframework.web.socket.CloseStatus status) {
        sessions.remove(session);
        String username = sessionToPlayer.remove(session);
        if (username != null) {
            onlinePlayers.remove(username);
            matchedPlayers.remove(username);
        }
        System.out.println("Player Disconnected: " + session.getId());
    }
}
