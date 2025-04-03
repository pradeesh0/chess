import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Editprofile.css";

const defaultProfilePics = [
  "default.png",
  "profile1.png",
  "profile2.png",
  "profile3.png",
  "profile4.png",
  "profile5.png",
  "profile6.png",
  "profile7.png",
  "profile8.png",
  "profile9.png",
  "profile10.png",
];

const EditProfile = ({ user, onUpdate }) => {
  const [name, setName] = useState(user?.name || "");
  const [selectedPic, setSelectedPic] = useState(user?.profilePic || defaultProfilePics[0]);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost:8080/api/users/Edit-profile", {
        email: user.email,
        name: name,
        profilePic: selectedPic
      });

      onUpdate(name, selectedPic);
      alert("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="edit-profile-modal">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        
        {/* Name Input Field */}
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

        {/* Profile Picture Selection */}
        <h3>Choose Profile Picture</h3>
        <div className="profile-pic-grid">
          {defaultProfilePics.map((pic, index) => (
            <img
              key={index}
              src={`/profile-pics/${pic}`}
              alt="Profile"
              className={selectedPic === pic ? "selected" : ""}
              onClick={() => setSelectedPic(pic)}
            />
          ))}
        </div>
        <div className="save-button-container">
        <button onClick={handleUpdate}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;