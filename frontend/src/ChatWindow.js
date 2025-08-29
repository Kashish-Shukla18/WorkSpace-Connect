import React, { useState, useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import "./ChatWindow.css"; // import css

function ChatWindow({ user, messages, onSend }) {
  const [text, setText] = useState("");
  const chatEndRef = useRef();

  const handleSend = () => {
    if (text.trim() === "") return;
    onSend(text);
    setText("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">{user.username}</div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.sender_id === user.id ? "received" : "sent"
            }`}
          >
            <div className="message-bubble">{msg.message}</div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <div className="chat-input">
        <MessageInput text={text} setText={setText} onSend={handleSend} />
      </div>
    </div>
  );
}

export default ChatWindow;
