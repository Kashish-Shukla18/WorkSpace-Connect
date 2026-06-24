import React, { useState, useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";

function formatTime(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

function ChatWindow({ user, messages, onSend, connected = true, canSend = true }) {
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

  // Group messages by date and consecutive sender
  const groupedMessages = [];
  let lastDate = null;
  let lastSenderId = null;

  messages.forEach((msg, idx) => {
    const msgDate = msg.created_at ? new Date(msg.created_at).toDateString() : new Date().toDateString();
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: 'separator', date: msg.created_at, id: `sep-${idx}` });
      lastDate = msgDate;
      lastSenderId = null;
    }
    const isConsecutive = lastSenderId === msg.sender_id;
    lastSenderId = msg.sender_id;
    groupedMessages.push({ ...msg, type: 'message', isConsecutive });
  });

  const isSent = (msg) => msg.sender_id !== user.id;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <span className="chat-header-name">{user.username}</span>
          <span className="chat-header-status">{connected ? 'Online' : 'Connecting…'}</span>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" title="Voice Call">📞</button>
          <button className="chat-action-btn" title="Search">🔍</button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <div className="chat-empty-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <p className="chat-empty-name">{user.username}</p>
            <p className="chat-empty-sub">Start the conversation</p>
          </div>
        )}

        {groupedMessages.map((item) => {
          if (item.type === 'separator') {
            return (
              <div key={item.id} className="date-separator">
                <span>{formatDateSeparator(item.date)}</span>
              </div>
            );
          }

          const sent = isSent(item);
          return (
            <div
              key={item.id}
              className={`chat-message ${sent ? 'sent' : 'received'} ${item.isConsecutive ? 'consecutive' : ''}`}
            >
              {!sent && !item.isConsecutive && (
                <div className="msg-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              {!sent && item.isConsecutive && <div className="msg-avatar-spacer" />}
              <div className="msg-content-wrap">
                <div className="message-bubble">
                  <span className="msg-text">{item.message}</span>
                  <span className="msg-time">{formatTime(item.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <MessageInput text={text} setText={setText} onSend={handleSend} disabled={!canSend} />
      </div>
    </div>
  );
}

export default ChatWindow;
