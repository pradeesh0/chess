import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css"; // Common CSS for both forms


const Login = ({setUser}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async(e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("All fields are required!");
      return;
    }
    setLoading(true); // Show loading animation
    try {
      const response = await axios.post("http://localhost:8080/api/users/login", { email, password }, { withCredentials: true });
      if (response.status === 200) {
        setUser(null); // Reset user state to prevent previous session data

        // Fetch updated session user details
      const userResponse = await axios.get("http://localhost:8080/api/users/session", { withCredentials: true });
      setUser(userResponse.data); // Set new user details
      sessionStorage.setItem("userEmail", userResponse.data.email); // ✅ Store in session storage
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);   
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials!");
      setLoading(false); // Stop loading if login fails
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>
        {loading ? <span className="loader"></span> : "Login"}
      </button>
      </form>
      <p>
        Don't have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
      </p>
    </div>
  );
}; 

export default Login;