import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMatchmakingWebSocket from "../Hooks/UseMatchmakingWebSocket";
import "./Gamepage.css";
const Matchmaking = () => {
  const navigate = useNavigate();
  const [playerEmail, setPlayerEmail] = useState(""); 
  const [matchRequest, setMatchRequest] = useState(null);

  const { onlinePlayers, registerPlayer, findMatch, acceptMatch } = useMatchmakingWebSocket(handleMatchMessage);

  useEffect(() => {
    // Get player email from session or authentication state
    const storedEmail = sessionStorage.getItem("userEmail"); 
    if (storedEmail) {
      setPlayerEmail(storedEmail);
      registerPlayer(storedEmail);
    } else {
      console.error("⚠️ No email found in session!");
      navigate("/login"); 
    }
  }, []);

  function handleMatchMessage(message) {
    console.log("🔹 WebSocket Matchmaking Message:", message);

    if (message.type === "matchRequest") {
      setMatchRequest(message.opponent);
    } 
    else if (message.type === "matchFound") {
      console.log("🎉 Match Found! Redirecting...");
      navigate("/chess", { state: { whitePlayer: message.whitePlayer, blackPlayer: message.blackPlayer } });
    } 
    else if (message.type === "startGame") {
      navigate("/chess", { state: { opponent: message.opponent } });
    }
  }

  return (
    <div className="matchmaking-container">
      <h2>♟️ Online Players</h2>
      {onlinePlayers.length === 0 ? (
        <p>No players online</p>
      ) : (
        <ul>
          {onlinePlayers.map((player) => (
            <li key={player}>
              {player} {player !== playerEmail && <button onClick={findMatch}>Play</button>}
            </li>
          ))}
        </ul>
      )}

      {matchRequest && (
        <div className="match-request">
          <p>🎮 {matchRequest} wants to play with you!</p>
          <button onClick={() => acceptMatch(matchRequest)}>Accept</button>
        </div>
      )}
    </div>
  );
};

export default Matchmaking;