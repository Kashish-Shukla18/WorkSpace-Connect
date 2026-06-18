import { API_BASE_URL } from './config';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import "./RoomChat.css";

function formatTime(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSep(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

function RoomChat({ room, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchMessages = async () => {
    if (!room?.id) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/rooms/${room.id}/messages`,
        { headers: { Authorization: token } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleNewMessage = (message) => {
    if (message.room_id === room.id) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !currentUser) return;
    socket.emit("sendRoomMessage", { roomId: room.id, message: newMessage });
    setNewMessage("");
  };

  useEffect(() => {
    if (!room?.id || !socket || !currentUser) return;
    fetchMessages();
    socket.emit("leaveAllRooms");
    socket.emit("joinRoom", { roomId: room.id });
    socket.on("receiveRoomMessage", handleNewMessage);
    return () => { socket.off("receiveRoomMessage", handleNewMessage); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, socket, currentUser]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Build grouped message list with date separators
  const grouped = [];
  let lastDate = null;
  let lastSenderId = null;
  let lastSenderTime = null;

  messages.forEach((msg, idx) => {
    const msgDate = msg.created_at ? new Date(msg.created_at).toDateString() : new Date().toDateString();
    if (msgDate !== lastDate) {
      grouped.push({ type: 'sep', date: msg.created_at, key: `sep-${idx}` });
      lastDate = msgDate;
      lastSenderId = null;
    }

    // Group by sender within 5 minutes
    const msgTime = msg.created_at ? new Date(msg.created_at).getTime() : Date.now();
    const timeDiff = lastSenderTime ? (msgTime - lastSenderTime) / 1000 / 60 : Infinity;
    const isGrouped = lastSenderId === msg.sender_id && timeDiff < 5;

    lastSenderId = msg.sender_id;
    lastSenderTime = msgTime;
    grouped.push({ ...msg, type: 'msg', isGrouped });
  });

  const isOwn = (msg) => msg.sender_id === currentUser?.id;

  return (
    <div className="room-chat">
      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="room-chat-empty">
            <div className="room-chat-empty-icon">#</div>
            <h4>Welcome to #{room?.name}</h4>
            <p>This is the beginning of the #{room?.name} channel. Say hello!</p>
          </div>
        )}

        {grouped.map((item) => {
          if (item.type === 'sep') {
            return (
              <div key={item.key} className="rc-date-separator">
                <span>{formatDateSep(item.date)}</span>
              </div>
            );
          }

          const own = isOwn(item);
          return (
            <div
              key={item.id}
              className={`rc-message ${own ? 'own' : ''} ${item.isGrouped ? 'grouped' : ''}`}
            >
              {!item.isGrouped ? (
                <div className="rc-msg-avatar">
                  {getInitial(item.sender_name)}
                </div>
              ) : (
                <div className="rc-msg-avatar-spacer" />
              )}

              <div className="rc-msg-body">
                {!item.isGrouped && (
                  <div className="rc-msg-meta">
                    <span className={`rc-msg-sender ${own ? 'own-sender' : ''}`}>
                      {own ? 'You' : (item.sender_name || 'Unknown')}
                    </span>
                    <span className="rc-msg-timestamp">{formatTime(item.created_at)}</span>
                  </div>
                )}
                <div className="rc-msg-content">
                  <span>{item.message}</span>
                  {item.isGrouped && (
                    <span className="rc-msg-hover-time">{formatTime(item.created_at)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="rc-input-area">
        <div className="rc-input-wrap">
          <input
            type="text"
            placeholder={`Message #${room?.name || 'channel'}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!currentUser || !socket}
            className="rc-input"
          />
          <button
            onClick={sendMessage}
            disabled={!currentUser || !socket || !newMessage.trim()}
            className="rc-send-btn"
            title="Send message"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomChat;
