import React from "react";
import "./UserList.css";

function UserList({ users, onSelect, selectedUser }) {
  return (
    <div className="user-list">
      {users.map((u) => (
        <div
          key={u.id}
          className={`user-circle ${selectedUser?.id === u.id ? "active" : ""}`}
          onClick={() => onSelect(u)}
          title={u.username} // show name on hover
        >
          {u.username.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

export default UserList;
