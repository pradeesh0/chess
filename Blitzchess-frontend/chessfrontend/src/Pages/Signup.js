import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Confirmpassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async(e) => {
    e.preventDefault();
    if (!name || !email || !password || !Confirmpassword) {
      setError("All fields are required!");
      return;
    }
    if (password !== Confirmpassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true); // Show loading animation
    try {
      const response = await axios.post("http://localhost:8080/api/users/register", { name, email, password, confirmPassword: Confirmpassword });

      if (response.status === 200) {
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed!");
      setLoading(false); // Show loading animation
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>} {/* ✅ Display success message */}
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={Confirmpassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        
        <button type="submit" disabled={loading}>
          {loading ? <span className="loader"></span> : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <span onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default Signup;