import { API_BASE_URL } from './config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './NotificationBell.css';
import { useApp } from './AppContext';

function NotificationBell() {
  const { currentUser, socket } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef(null);
  const token = localStorage.getItem('token');

  const isUnread = (n) => n.is_read === false || n.is_read === 'f' || !n.is_read;

  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: token },
      });
      const list = res.data || [];
      setNotifications(list);
      setUnreadCount(list.filter(isUnread).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchNotifications]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNew = (notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || 'New notification', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    };

    const handleCount = ({ count }) => {
      setUnreadCount(count);
    };

    socket.on('newNotification', handleNew);
    socket.on('notificationCountUpdate', handleCount);

    return () => {
      socket.off('newNotification', handleNew);
      socket.off('notificationCountUpdate', handleCount);
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: token },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: token },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      fetchNotifications();
    }
  };

  const handleItemClick = (notification) => {
    if (isUnread(notification)) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      <button
        className="bell-button"
        onClick={handleToggle}
        type="button"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read" type="button">
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${isUnread(notification) ? 'unread' : 'read'}`}
                  onClick={() => handleItemClick(notification)}
                  onKeyDown={(e) => e.key === 'Enter' && handleItemClick(notification)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.created_at).toLocaleString()}</small>
                  </div>
                  {isUnread(notification) && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
