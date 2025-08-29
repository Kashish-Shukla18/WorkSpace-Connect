import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./RoomChat.css";

function RoomChat({ room, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("💬 RoomChat mounted/updated");
    console.log("📞 Room:", room);
    console.log("👤 Current user:", currentUser);
    console.log("🔌 Socket:", socket ? "Connected" : "Disconnected");
  }, [room, currentUser, socket]);

  const fetchMessages = async () => {
    console.group("📥 fetchMessages()");
    if (!room?.id) {
      console.warn("⚠️ No room ID");
      console.groupEnd();
      return;
    }
    try {
      console.log(`🌐 Fetching messages for room ${room.id}`);
      const res = await axios.get(
        `http://172.24.109.63:5000/api/rooms/${room.id}/messages`,
        { headers: { Authorization: token } }
      );
      console.log(`✅ Retrieved ${res.data.length} messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("❌ Error fetching messages:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Message:", err.message);
    }
    console.groupEnd();
  };

  const handleNewMessage = (message) => {
    console.group("📨 handleNewMessage()");
    console.log("New message received:", message);
    if (message.room_id === room.id) {
      console.log("✅ Message belongs to current room, adding to state");
      setMessages((prev) => [...prev, message]);
    } else {
      console.log("❌ Message doesn't belong to current room, ignoring");
    }
    console.groupEnd();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    console.group("📤 sendMessage()");
    if (!newMessage.trim()) {
      console.warn("⚠️ Message is empty");
      console.groupEnd();
      return;
    }

    if (!socket) {
      console.error("❌ Socket not available");
      console.groupEnd();
      return;
    }

    if (!currentUser) {
      console.error("❌ Current user not available");
      console.groupEnd();
      return;
    }

    console.log("Emitting sendRoomMessage event:", {
      roomId: room.id,
      message: newMessage
    });
    
    socket.emit("sendRoomMessage", {
      roomId: room.id,
      message: newMessage,
    });

    setNewMessage("");
    console.groupEnd();
  };

  useEffect(() => {
    console.group("🔌 Socket setup effect");
    if (!room?.id || !socket || !currentUser) {
      console.warn("⚠️ Missing room ID, socket, or current user");
      console.groupEnd();
      return;
    }

    fetchMessages();

    console.log("Leaving all rooms and joining room:", room.id);
    socket.emit("leaveAllRooms");
    socket.emit("joinRoom", { roomId: room.id });

    socket.on("receiveRoomMessage", handleNewMessage);
    console.log("✅ Socket event listener added for receiveRoomMessage");

    return () => {
      console.log("🧹 Cleaning up socket event listeners");
      socket.off("receiveRoomMessage", handleNewMessage);
    };
  }, [room?.id, socket, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="room-chat">
      <h3>#{room?.name}</h3>
      {/* <div className="debug-info" style={{fontSize: '11px', color: '#666', marginBottom: '10px'}}>
        Room ID: {room?.id}, Messages: {messages.length}, 
        Socket: {socket ? "Connected" : "Disconnected"}, 
        User: {currentUser ? currentUser.username : "Not logged in"}
      </div> */}

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.sender_id === currentUser?.id ? "own-message" : ""
            }`}
          >
            <div className="message-sender">{msg.sender_name || "Unknown"}:</div>
            <div className="message-content">{msg.message}</div>
            <div className="message-time">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!currentUser || !socket}
        />
        <button onClick={sendMessage} disabled={!currentUser || !socket}>
          Send
        </button>
      </div>
    </div>
  );
}

export default RoomChat;