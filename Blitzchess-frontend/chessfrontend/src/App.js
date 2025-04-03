import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from './Components/Dashboard';
import EditProfile from './Pages/EditProfile';
import axios from 'axios';
import Matchmaking from './Components/Gamepage';
import ResultPage from './Pages/ResultPage';
import ChessGame from './Components/Chess';
import "./App.css";
function App() {
  const [user, setUser] = useState(null);

  // Fetch user session
  useEffect(() => {
    axios.get("http://localhost:8080/api/users/session", { withCredentials: true })
      .then(response => {
        setUser(response.data);  // Update user state with backend session data
      })
      .catch(error => {
        console.error("Error fetching user session", error);
        setUser(null);  // Clear state if session is invalid
      });
  }, []);

  // Function to update user profile
  const handleUpdate = (updatedName, updatedPic) => {
    setUser(prevUser => ({
      ...prevUser,
      name: updatedName,
      profilePic: updatedPic
    }));
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/game" element={<Matchmaking />} />
          <Route path="/chess" element={<ChessGame />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/Edit-Profile" element={<EditProfile user={user} onUpdate={handleUpdate} />} />
          <Route path="*" element={<Login setUser={setUser} />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;