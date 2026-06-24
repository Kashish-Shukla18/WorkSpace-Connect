import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import "./MessageInput.css";

function MessageInput({ text, setText, onSend, disabled = false }) {
  return (
    <div className="message-input">
      <input
        placeholder={disabled ? "Connecting…" : "Type a message..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && onSend()}
        disabled={disabled}
      />
      <button onClick={onSend} disabled={disabled}>
        <FaPaperPlane />
      </button>
    </div>
  );
}

export default MessageInput;
