import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

const SOCKET_URL = "ws://localhost:8080/game";

const useChessWebSocket = (onMessageReceived) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(SOCKET_URL, {
    onOpen: () => console.log("WebSocket Connected"),
    onClose: () => console.log("WebSocket Disconnected"),
    onError: (event) => console.error("WebSocket Error:", event),
    shouldReconnect: () => true, // Auto-reconnect on disconnect
  });

  useEffect(() => {
    if (lastMessage !== null) {
      console.log("Raw WebSocket Message:", lastMessage.data);
      try {
        let data = JSON.parse(lastMessage.data);;
        console.log("Parsed WebSocket Message:", data);

        if (onMessageReceived) {
          onMessageReceived(data);
        }
       
      } catch (error) {
        console.error("Invalid JSON received:", lastMessage.data, error);
      }
    }
  }, [lastMessage, onMessageReceived]);

  return { sendMessage, readyState };
};

export default useChessWebSocket;