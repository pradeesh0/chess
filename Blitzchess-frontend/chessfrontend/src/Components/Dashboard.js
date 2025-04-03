import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const tabRef = useRef(null);
  const defaultProfilePic = "default.png";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/session", { withCredentials: true });
        if (response.status === 200) {
          setUser(response.data); // Store user details
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Session check failed", error);
        setUser(null);
        navigate("/login");
      }
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  const handleLogout = async() => {
    try {
      await axios.post("http://localhost:8080/api/users/logout", {}, { withCredentials: true });
      sessionStorage.clear(); // Clear session storage
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed!", error);
    }
  };

  const toggleTab = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tabRef.current && !tabRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="settings-container" ref={tabRef}>
        <img 
          src="gear.png"  
          alt="Settings" 
          className="settings-icon" 
          onClick={toggleTab} 
        />
        {isOpen && (
          <div className={`logout-tab ${isOpen ? "show" : ""}`}>
            <button className="edit-profile-button" onClick={() => navigate("/edit-profile")}>
              Edit Profile
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="user-profile">
        <img src={`/profile-pics/${user?.profilePic || defaultProfilePic}`}  alt="Profile" className="profile-pic" />
        <div className="user-info">
          <h2>{user?.name || "Username"}</h2>
          <p>Rating: {user?.rating || "1500"}</p>
          <p>Total Games: {user?.totalgames || "0"}</p>
        </div>
      </div>

      <div className="play-chess">
        <button onClick={() => navigate("/game")} className="start-game-btn">
          Start New Game
        </button>
      </div>
    </div>
  );
};

export default Dashboard;