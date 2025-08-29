import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import "./MessageInput.css";

function MessageInput({ text, setText, onSend }) {
  return (
    <div className="message-input">
      <input
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button onClick={onSend}>
        <FaPaperPlane />
      </button>
    </div>
  );
}

export default MessageInput;
