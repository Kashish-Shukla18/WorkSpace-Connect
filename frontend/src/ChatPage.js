import { API_BASE_URL } from './config';
import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import Layout from "./Layout";


const socket = io(`${API_BASE_URL}`); // backend

function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [token] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) return;

    // authenticate socket
    socket.emit("authenticate", token);

    // receive messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // fetch users
    axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: token }
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error(err));

    return () => {
      socket.off("receiveMessage");
    };
  }, [token]);

  const fetchMessages = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/${userId}`, {
      headers: { Authorization: token }
    });
    console.log("Fetched messages:", res.data);
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
    if (!selectedUser) return;
    socket.emit("sendMessage", { receiverId: selectedUser.id, message: text });
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
