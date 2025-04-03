import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Resultpage.css";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, rating, winnerEmail, loserEmail } = location.state || {};

  return (
    <div className="result-container">
      <h1>Game Over!</h1>
      <h2 className="result-message">{result}</h2>

      {rating && (
        <div className="rating-container">
          <h3>Updated Ratings</h3>
          <p><strong>Winner:</strong> {winnerEmail} - New Rating: {rating.winnerRating}</p>
          <p><strong>Loser:</strong> {loserEmail} - New Rating: {rating.loserRating}</p>
        </div>
      )}

      <div className="button-container">
        <button className="home-button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
        <button className="new-game-button" onClick={() => navigate("/game")}>
          Start New Game
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
