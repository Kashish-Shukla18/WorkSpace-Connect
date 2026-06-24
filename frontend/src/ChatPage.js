import { API_BASE_URL } from './config';
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import Layout from "./Layout";
import { useApp } from './AppContext';
import './ChatPage.css';

const sameUser = (a, b) => Number(a) === Number(b);

function isConversationMessage(msg, meId, partnerId) {
  return (
    (sameUser(msg.sender_id, meId) && sameUser(msg.receiver_id, partnerId)) ||
    (sameUser(msg.sender_id, partnerId) && sameUser(msg.receiver_id, meId))
  );
}

function ChatPage() {
  const { currentUser, socket, socketReady } = useApp();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [token] = useState(localStorage.getItem("token"));
  const selectedUserRef = useRef(null);
  const currentUserRef = useRef(null);

  selectedUserRef.current = selectedUser;
  currentUserRef.current = currentUser;

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      const withoutTemps = prev.filter(
        (m) =>
          !String(m.id).startsWith('temp-') ||
          m.message !== msg.message ||
          !sameUser(m.sender_id, msg.sender_id)
      );
      return [...withoutTemps, msg];
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: token }
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      const me = currentUserRef.current;
      const partner = selectedUserRef.current;
      if (!me || !partner) return;
      if (!isConversationMessage(msg, me.id, partner.id)) return;
      appendMessage(msg);
    };

    socket.on("receiveMessage", onMessage);
    return () => socket.off("receiveMessage", onMessage);
  }, [socket, appendMessage]);

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/messages/${userId}`, {
        headers: { Authorization: token }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err.response || err);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const sendMessage = (text) => {
    if (!selectedUser || !socket || !currentUser || !socketReady || !text.trim()) return;

    const trimmed = text.trim();
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("sendMessage", {
      receiverId: Number(selectedUser.id),
      message: trimmed,
    });
  };

  return (
    <Layout>
    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-3 border-end">
        <UserList users={users} onSelect={handleUserSelect} selectedUser={selectedUser} />
      </div>
      <div className="col-9">
        {selectedUser ? (
          <ChatWindow
            user={selectedUser}
            messages={messages}
            onSend={sendMessage}
            connected={socketReady}
            canSend={socketReady}
          />
        ) : (
          <div className="d-flex h-100 align-items-center justify-content-center text-muted">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default ChatPage;
