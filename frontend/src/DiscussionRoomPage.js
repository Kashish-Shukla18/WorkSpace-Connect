import { API_BASE_URL } from './config';
import React, { useState, useEffect } from "react";
import DiscussionRoomList from "./DiscussionRoomList";
import RoomChat from "./RoomChat";
import axios from "axios";
import "./DiscussionRoomPage.css";

function DiscussionRoomPage({ currentUser, socket }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("🏠 DiscussionRoomPage mounted");
    console.log("👤 Current user:", currentUser);
    console.log("🔌 Socket status:", socket ? "Connected" : "Disconnected");
  }, [currentUser, socket]);

  useEffect(() => {
    if (selectedRoom && selectedRoom.id) {
      console.log("🔄 Room selected, fetching details:", selectedRoom);
      fetchRoomDetails();
    } else {
      console.log("❌ No room selected or room has no ID");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  const fetchRoomDetails = async () => {
    console.group("📥 fetchRoomDetails()");
    try {
      console.log(`🌐 Fetching details for room ${selectedRoom.id}`);
      const res = await axios.get(
        `${API_BASE_URL}/api/rooms/${selectedRoom.id}`,
        { headers: { Authorization: token } }
      );
      console.log("✅ Room details:", res.data);
      console.log("👥 Members:", res.data.users?.length);
      
      setRoomDetails(res.data);
    } catch (err) {
      console.error("❌ Error fetching room details:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Message:", err.message);
      alert(err.response?.data?.error || "Failed to load room details");
    }
    console.groupEnd();
  };

  const handleAddUser = async () => {
    console.group("👥 handleAddUser()");
    if (!newUserEmail.trim()) {
      console.warn("⚠️ Email is empty");
      console.groupEnd();
      return;
    }
    if (!selectedRoom) {
      console.warn("⚠️ No room selected");
      console.groupEnd();
      return;
    }
    
    try {
      console.log(`📤 Adding user ${newUserEmail} to room ${selectedRoom.id}`);
      const res = await axios.post(
        `${API_BASE_URL}/api/rooms/${selectedRoom.id}/add-user`,
        { email: newUserEmail },
        { headers: { Authorization: token } }
      );
      console.log("✅ User added:", res.data);
      alert("User added successfully!");
      setNewUserEmail("");
      fetchRoomDetails();
    } catch (err) {
      console.error("❌ Error adding user:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Message:", err.message);
      alert(err.response?.data?.error || "Failed to add user");
    }
    console.groupEnd();
  };

  return (
    <div className="discussion-room-container">
      <div className="debug-header">
        Debug: User ID: {currentUser?.id}, Selected Room: {selectedRoom?.id}, Room Details: {roomDetails ? "Loaded" : "Not loaded"}
      </div>
      
      <div className="discussion-layout">
        <div className="sidebar-section">
          <DiscussionRoomList
            onSelect={setSelectedRoom}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
          />
        </div>
        
        <div className="content-section">
          {selectedRoom ? (
            <div className="room-details">
              <h2>#{selectedRoom.name}</h2>
              {/* <div className="debug-info" style={{fontSize: '11px', color: '#666'}}>
                Room ID: {selectedRoom.id}, Created by: {selectedRoom.created_by} (Current user: {currentUser?.id})
              </div> */}

              {roomDetails && (
                <>
                  <h4>Members:</h4>
                  <ul>
                    {roomDetails.users?.map((u) => (
                      <li key={u.id}>{u.username || u.email}</li>
                    ))}
                  </ul>

                  {/* Add User Section - Only show for room creator */}
                  {roomDetails && currentUser && Number(roomDetails.created_by) === Number(currentUser.id) && (
                    <div className="add-user-section">
                      <h4>Add User to Room</h4>
                      <div className="add-user-form">
                        <input
                          type="email"
                          placeholder="Enter user email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="add-user-input"
                        />
                        <button onClick={handleAddUser} className="add-user-button">
                          Add User
                        </button>
                      </div>
                    </div>
                  )}

                  <RoomChat 
                    room={selectedRoom} 
                    currentUser={currentUser} 
                    socket={socket} 
                  />
                </>
              )}
            </div>
          ) : (
            <p className="select-room-prompt">Select a discussion room to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoomPage;