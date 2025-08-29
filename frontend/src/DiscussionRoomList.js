import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DiscussionRoomList.css";
import Layout from "./Layout";

function DiscussionRoomList({ onSelect, selectedRoom, currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("🔄 useEffect running, fetching rooms...");
    console.log("📋 Current user:", currentUser);
    console.log("🔑 Token exists:", !!token);
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRooms = async () => {
    console.group("📥 fetchRooms()");
    if (!token) {
      console.error("❌ No token found");
      alert("You must be logged in to view rooms.");
      console.groupEnd();
      return;
    }
    try {
      console.log("🌐 Making API request to /api/rooms");
      const res = await axios.get("http://172.24.109.63:5000/api/rooms", {
        headers: { Authorization: token },
      });

      console.log("✅ API Response (rooms):", res.data);
      console.log("📊 Number of rooms:", res.data.length);

      setRooms(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching rooms:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Message:", err.message);
      alert("Failed to load rooms. Make sure you are logged in.");
    }
    console.groupEnd();
  };

  const handleCreateRoom = async () => {
    console.group("➕ handleCreateRoom()");
    if (!newRoom.trim()) {
      console.warn("⚠️ Room name is empty");
      console.groupEnd();
      return;
    }
    if (!token) {
      console.error("❌ No token found");
      alert("You must be logged in to create a room.");
      console.groupEnd();
      return;
    }

    try {
      console.log("📤 Creating room with name:", newRoom);
      const res = await axios.post(
        "http://172.24.109.63:5000/api/rooms",
        { name: newRoom, description: "" },
        { headers: { Authorization: token } }
      );
      console.log("✅ Room created:", res.data);

      const createdRoom = res.data;
      setRooms((prev) => [...prev, createdRoom]);
      setNewRoom("");
      onSelect(createdRoom); // auto-select new room
      console.log("🔄 Room added to state and selected");
    } catch (err) {
      console.error("❌ Error creating room:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Message:", err.message);
      alert(err.response?.data?.error || "Failed to create room");
    }
    console.groupEnd();
  };

  return (
    <Layout>
    <div className="room-list">
      <h4>Discussion Rooms</h4>
      {/* <div className="debug-info" style={{fontSize: '10px', color: '#666', marginBottom: '10px'}}>
        User: {currentUser?.username} (ID: {currentUser?.id}), Rooms: {rooms.length}
      </div> */}

      <div className="rooms">
        {rooms.length ? (
          rooms.map((r) => {
            console.log("🔍 Rendering room:", r);
            return (
              <button
                key={r.id}
                className={`room-item ${selectedRoom?.id === r.id ? "active" : ""}`}
                onClick={() => {
                  console.log("🎯 Room selected:", r);
                  onSelect(r);
                }}
              >
                #{r.name} {r.created_by_name && `(Admin: ${r.created_by_name})`}
              </button>
            );
          })
        ) : (
          <p>No rooms available.</p>
        )}
      </div>

      <div className="room-input">
        <input
          type="text"
          placeholder="New Room..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
        />
        <button onClick={handleCreateRoom}>+</button>
      </div>
    </div>
    </Layout>
  );
}

export default DiscussionRoomList;
