import { API_BASE_URL } from './config';
import React, { useState, useEffect } from "react";
import DiscussionRoomList from "./DiscussionRoomList";
import RoomChat from "./RoomChat";
import axios from "axios";
import "./DiscussionRoomPage.css";

function DiscussionRoomPage({ currentUser, socket }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [addUserMsg, setAddUserMsg] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (selectedRoom?.id) {
      fetchRoomDetails();
      setShowMembers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  const fetchRoomDetails = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/rooms/${selectedRoom.id}`,
        { headers: { Authorization: token } }
      );
      setRoomDetails(res.data);
    } catch (err) {
      console.error("Error fetching room details:", err);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !selectedRoom) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/rooms/${selectedRoom.id}/add-user`,
        { email: newUserEmail },
        { headers: { Authorization: token } }
      );
      setAddUserMsg({ type: 'success', text: 'User added successfully!' });
      setNewUserEmail("");
      fetchRoomDetails();
      setTimeout(() => setAddUserMsg(null), 3000);
    } catch (err) {
      setAddUserMsg({ type: 'error', text: err.response?.data?.error || "Failed to add user" });
      setTimeout(() => setAddUserMsg(null), 4000);
    }
  };

  const isCreator = roomDetails && currentUser &&
    Number(roomDetails.created_by) === Number(currentUser.id);

  return (
    <div className="discussion-room-container">
      <div className="discussion-layout">

        {/* ── Left: Channel List ── */}
        <aside className="discussion-sidebar">
          <div className="discussion-sidebar-header">
            <span className="discussion-workspace-name">Workspace</span>
          </div>
          <DiscussionRoomList
            onSelect={setSelectedRoom}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
          />
        </aside>

        {/* ── Right: Chat Area ── */}
        <main className="discussion-main">
          {selectedRoom ? (
            <div className="discussion-chat-layout">

              {/* Channel Header */}
              <div className="discussion-chat-header">
                <div className="discussion-channel-title">
                  <span className="channel-hash">#</span>
                  <span className="channel-name">{selectedRoom.name}</span>
                </div>
                <div className="discussion-header-actions">
                  {roomDetails && (
                    <button
                      className={`members-toggle-btn ${showMembers ? 'active' : ''}`}
                      onClick={() => setShowMembers(!showMembers)}
                      title="Toggle Members"
                    >
                      <span className="members-icon">👥</span>
                      <span className="members-count">{roomDetails.users?.length || 0}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat + Members Panel */}
              <div className="discussion-body">
                {/* Chat */}
                <div className="discussion-chat-area">
                  {roomDetails ? (
                    <RoomChat
                      room={selectedRoom}
                      currentUser={currentUser}
                      socket={socket}
                    />
                  ) : (
                    <div className="discussion-loading">Loading room...</div>
                  )}
                </div>

                {/* Members Panel */}
                {showMembers && roomDetails && (
                  <aside className="members-panel">
                    <div className="members-panel-header">
                      Members — {roomDetails.users?.length || 0}
                    </div>
                    <div className="members-list">
                      {roomDetails.users?.map((u) => (
                        <div key={u.id} className="member-item">
                          <div className="member-avatar">
                            {(u.username || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="member-info">
                            <span className="member-name">{u.username || u.email}</span>
                            {Number(roomDetails.created_by) === Number(u.id) && (
                              <span className="member-role">Owner</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add User (creator only) */}
                    {isCreator && (
                      <div className="add-member-section">
                        <div className="add-member-title">Add Member</div>
                        {addUserMsg && (
                          <div className={`add-user-msg ${addUserMsg.type}`}>
                            {addUserMsg.text}
                          </div>
                        )}
                        <div className="add-member-form">
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                            className="add-member-input"
                          />
                          <button onClick={handleAddUser} className="add-member-btn">
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </aside>
                )}
              </div>
            </div>
          ) : (
            <div className="discussion-empty">
              <div className="discussion-empty-icon">💬</div>
              <h3 className="discussion-empty-title">Select a channel</h3>
              <p className="discussion-empty-sub">Choose a room from the sidebar to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DiscussionRoomPage;
