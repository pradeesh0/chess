import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = "ws://localhost:8080/game";

const useMatchmakingWebSocket = (onMessageReceived) => {
    const navigate = useNavigate();
  const { sendMessage, lastMessage } = useWebSocket(SOCKET_URL, {
    onOpen: () => console.log("✅ Matchmaking WebSocket Connected"),
    onClose: () => console.log("❌ Matchmaking WebSocket Disconnected"),
    onError: (event) => console.error("⚠️ WebSocket Error:", event),
    shouldReconnect: () => true, 
    
  });

  const [onlinePlayers, setOnlinePlayers] = useState([]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log("🔹 WebSocket Message:", data);

        if (data.type === "onlinePlayers") {
          setOnlinePlayers((prevPlayers) => {
            return JSON.stringify(prevPlayers) !== JSON.stringify(data.players) ? data.players : prevPlayers;
          });
        }
        else if (data.type === "matchFound") {
          console.log("🎉 Match Found! Redirecting...");
          navigate("/chess", { state: { 
            whitePlayer: data.player1, 
            blackPlayer: data.player2 
          }  });
        } 
        else if (onMessageReceived) {
          onMessageReceived(data);
        }
      } catch (error) {
        console.error("🚨 Invalid JSON received:", lastMessage.data, error);
      }
    }
  }, [lastMessage, onMessageReceived, navigate, onlinePlayers]);

  const registerPlayer = (email) => {
    sendMessage(JSON.stringify({ type: "join", username: email }));
  };

  const findMatch = () => {
    sendMessage(JSON.stringify({ type: "findPlayer" }));
  };

  return { onlinePlayers, registerPlayer, findMatch };
};

export default useMatchmakingWebSocket;