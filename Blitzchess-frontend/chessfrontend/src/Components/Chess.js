import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import useChessWebSocket from "../Hooks/useWebSocket";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import axios from "axios";
import "./Chess.css";


const ChessGame = () => {

   // Retrieve logged-in player email
   const loggedInPlayerEmail = (sessionStorage.getItem("userEmail") || "").trim().toLowerCase();
   
  const [game, setGame] = useState(new Chess());
  const [whiteTime, setWhiteTime] = useState(300); // 5 minutes in seconds
  const [blackTime, setBlackTime] = useState(300);
  const [turn, setTurn] = useState("w"); // 'w' for White, 'b' for Black
  const [invalidMoveMessage, setInvalidMoveMessage] = useState(""); // Message for invalid moves
  const [gameResult, setGameResult] = useState(""); // Stores game result message
  const [gameOver, setGameOver] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [lastMove, setLastMove] = useState(null); // Track the last move
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { whitePlayer, blackPlayer } = location.state || {}; // Get player emails
  
  const [whitePlayerEmail] = useState(whitePlayer || ""); 
  const [blackPlayerEmail] = useState(blackPlayer || ""); 

  

  // WebSocket setup
  const handleMoveReceived = useCallback((message) => {
  
    if (message?.moveData?.fen) {
      setGame((prevGame) => {
        const newGame = new Chess();
        newGame.load(message.moveData.fen);
        return newGame;
      });
  
      setTurn(message.moveData.turn);
      setLastMove({ from: message.moveData.from, to: message.moveData.to });
    }else if (message?.type === "gameOver") {
      setGameOver(true);
      navigate("/result", { state: { result: message.result, rating: message.rating } });
    } else {
      console.error("Invalid move received:", message);
    }
  }, [navigate]);
  const { sendMessage } = useChessWebSocket(handleMoveReceived);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setWhiteTime((prev) => (turn === "w" ? Math.max(0, prev - 1) : prev));
      setBlackTime((prev) => (turn === "b" ? Math.max(0, prev - 1) : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameOver]);

  const handleGameEnd = useCallback( async(result) => {
      setGameResult(result);
      setGameOver(true);
      setLoading(true)
      setTimeout(async () => {
      try {
        let winnerEmail = "";
        let loserEmail = "";

        if (result.includes("White Wins")) {
          winnerEmail = whitePlayerEmail; 
          loserEmail = blackPlayerEmail;
        } else if (result.includes("Black Wins")) {
          winnerEmail = blackPlayerEmail;
          loserEmail = whitePlayerEmail;
        }

        if (winnerEmail && loserEmail) {
          const response = await axios.post("http://localhost:8080/api/users/updateRating", {
            winnerEmail,
            loserEmail,
          },{ withCredentials: true },);

          console.log("Updated Ratings:", response.data);
          // Send game over message via WebSocket
      sendMessage(JSON.stringify({ type: "gameOver", result, rating: response.data, winnerEmail,loserEmail}))
          navigate("/result", { state: { result, rating: response.data} });
        }
      } catch (error) {
        console.error("Error updating rating:", error);
      }
      setLoading(false);
    },3000);
  }, [navigate,whitePlayerEmail,blackPlayerEmail,sendMessage] // Dependencies for useCallback
  );

  useEffect(() => {
    if (whiteTime === 0 && !gameOver) {
      handleGameEnd("Black Wins by Timeout!");
    } else if (blackTime === 0 && !gameOver) {
      handleGameEnd("White Wins by Timeout!");
    }
  }, [whiteTime, blackTime, gameOver,handleGameEnd]);

  
  const onDrop = (sourceSquare, targetSquare) => {
    if (gameOver || whiteTime === 0 || blackTime === 0) return false;

    const gameCopy = new Chess(game.fen());
    const currentTurn = gameCopy.turn();
  

   


  // Ensure only the correct player moves their pieces
  if ((currentTurn === "w" && loggedInPlayerEmail !== whitePlayerEmail.toLowerCase()) ||
      (currentTurn === "b" && loggedInPlayerEmail !== blackPlayerEmail.toLowerCase())) {
    setInvalidMoveMessage("Not your turn!");
    setTimeout(() => setInvalidMoveMessage(""), 1000);
    return false;
  }

    // Check if the move is legal before executing it
  const possibleMoves = gameCopy.moves({ square: sourceSquare, verbose: true });
  const isValidMove = possibleMoves.some(
    (move) => move.to === targetSquare
  );

  if (!isValidMove) {
    setInvalidMoveMessage("Invalid Move!");
    setTimeout(() => setInvalidMoveMessage(""), 1000);
    return false;
  }

    const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

    if (!move) {
      setInvalidMoveMessage("Invalid Move!");
      setTimeout(() => setInvalidMoveMessage(""), 1000);
      return false; 
    }

    if (gameCopy.isCheckmate()) {
      handleGameEnd(`${currentTurn === "w" ? "White" : "Black"} Wins by Checkmate!`);
    } else if (gameCopy.isDraw()) {
      handleGameEnd("Game Draw!");
    } else if (gameCopy.isCheck()) {
      setCheckMessage(`${gameCopy.turn() === "w" ? "White" : "Black"} is in Check!`);
      setTimeout(() => setCheckMessage(""), 2000);
    }

    setGame((prevGame) => {
      const updatedGame = new Chess(prevGame.fen());
      updatedGame.load(gameCopy.fen());
      return new Chess(updatedGame.fen()); // Ensure new reference
    });
    
    setTurn(gameCopy.turn());
    setLastMove({ from: sourceSquare, to: targetSquare });
    setInvalidMoveMessage("");

    sendMessage(JSON.stringify({ type: "move", from: sourceSquare, to: targetSquare,fen: gameCopy.fen(),turn: gameCopy.turn() }));
    return true;
  };

  const customSquareStyles = lastMove
    ? {
        [lastMove.from]: { backgroundColor: "rgba(123, 229, 123, 0.5)" },
        [lastMove.to]: { backgroundColor: "rgba(69, 127, 69, 0.5)" },
      }
    : {};
   
  return (
    <div className="chessboard-container">
      <h2>BlitzChess - Fast-Paced Chess!</h2>
      {loading && <div className="loading-overlay">Loading...</div>}
      <div className="timer-container">
        <h3>White Time: {Math.floor(whiteTime / 60)}:{("0" + (whiteTime % 60)).slice(-2)}</h3>
        <h3>Black Time: {Math.floor(blackTime / 60)}:{("0" + (blackTime % 60)).slice(-2)}</h3>
      </div>
      <div className="message-row">
  <div className={`check-message-container ${checkMessage ? "show" : ""}`}>
    {checkMessage && <h3>{checkMessage}</h3>}
  </div>
  <div className={`invalid-move-container ${invalidMoveMessage ? "show" : ""}`}>
    {invalidMoveMessage && <h3>{invalidMoveMessage}</h3>}
  </div>
</div>
      <div className="chessboard">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} customSquareStyles={customSquareStyles} boardWidth={500} className="chessboard"   boardOrientation={loggedInPlayerEmail === whitePlayerEmail.toLowerCase() ? "white" : "black"} 
        />
      </div>
      {gameResult && <h2 className="winner-message">{gameResult}</h2>}
    </div>
  );
};

export default ChessGame;