import { API_BASE_URL } from './config';
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DiscussionRoomList.css";

function DiscussionRoomList({ onSelect, selectedRoom, currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRooms = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/rooms`, {
        headers: { Authorization: token },
      });
      setRooms(res.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.trim() || !token) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/rooms`,
        { name: newRoom, description: "" },
        { headers: { Authorization: token } }
      );
      const createdRoom = res.data;
      setRooms((prev) => [...prev, createdRoom]);
      setNewRoom("");
      onSelect(createdRoom);
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return (
    <div className="room-list">
      <div className="room-list-section-title">Channels</div>

      <div className="rooms">
        {rooms.length ? (
          rooms.map((r) => (
            <button
              key={r.id}
              className={`room-item ${selectedRoom?.id === r.id ? "active" : ""}`}
              onClick={() => onSelect(r)}
            >
              <span className="room-hash">#</span>
              <span className="room-name-text">{r.name}</span>
            </button>
          ))
        ) : (
          <p className="no-rooms-msg">No channels yet</p>
        )}
      </div>

      <div className="room-input">
        <input
          type="text"
          placeholder="New channel..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
        />
        <button onClick={handleCreateRoom} title="Create channel">+</button>
      </div>
    </div>
  );
}

export default DiscussionRoomList;
