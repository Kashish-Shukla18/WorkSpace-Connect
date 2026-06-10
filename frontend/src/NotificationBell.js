import { API_BASE_URL } from './config';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './NotificationBell.css';

function NotificationBell({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const audioRef = useRef(null);
  const token = localStorage.getItem('token');

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    tabActive: true,
    notificationPermission: 'default',
    audioReady: false,
    socketConnected: false,
    lastSoundAttempt: null
  });

  // 1. Initial fetch and polling
  useEffect(() => {
    console.log('🔔 NotificationBell mounted with currentUser:', currentUser);
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        console.log('🔔 Clearing notification polling interval');
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // 2. Socket.io connection for real-time updates
  useEffect(() => {
    if (currentUser && token) {
      console.log('🔔 Connecting to Socket.io server...');
      const socket = io(`${API_BASE_URL}`, {
        auth: { token }
      });

      socket.on('connect', () => {
        console.log('✅ Connected to notification server');
        setDebugInfo(prev => ({ ...prev, socketConnected: true }));
      });

      socket.on('newNotification', (notification) => {
        console.log('📨 New notification received via Socket.io:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      socket.on('notificationCountUpdate', ({ count }) => {
        console.log('🔢 Notification count updated via Socket.io:', count);
        setUnreadCount(count);
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from notification server');
        setDebugInfo(prev => ({ ...prev, socketConnected: false }));
      });

      socket.on('error', (error) => {
        console.error('❌ Socket.io error:', error);
      });

      return () => {
        console.log('🔔 Disconnecting Socket.io');
        socket.disconnect();
      };
    }
  }, [currentUser, token]);

  // 3. Handle sound and system notifications
  useEffect(() => {
    console.log('🔔 Unread count changed:', {
      previous: previousUnreadCount,
      current: unreadCount,
      hasNewNotifications: unreadCount > previousUnreadCount,
      isTabActive: isTabActive()
    });

    // Check if there are new unread notifications
    if (unreadCount > previousUnreadCount) {
      const tabActive = isTabActive();
      console.log('📋 Tab active status:', tabActive);

      if (!tabActive) {
        console.log('🚨 Tab not active - attempting to play sound and show notification');
        playNotificationSound();
        showSystemNotification();
      } else {
        console.log('ℹ️ Tab is active - skipping sound/notification');
      }
    }
    setPreviousUnreadCount(unreadCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount, previousUnreadCount]);

  // 4. Audio element ready check
  useEffect(() => {
    const currentAudio = audioRef.current;
    const checkAudio = () => {
      if (currentAudio) {
        const isReady = currentAudio.readyState >= 2; // HAVE_ENOUGH_DATA
        console.log('🎵 Audio element ready state:', {
          readyState: currentAudio.readyState,
          isReady: isReady,
          src: currentAudio.currentSrc
        });
        setDebugInfo(prev => ({ ...prev, audioReady: isReady }));
      }
    };

    if (currentAudio) {
      currentAudio.addEventListener('loadeddata', checkAudio);
      currentAudio.addEventListener('canplay', checkAudio);
      checkAudio();
    }

    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('loadeddata', checkAudio);
        currentAudio.removeEventListener('canplay', checkAudio);
      }
    };
  }, []);

  // 5. Check notification permission
  useEffect(() => {
    const checkPermission = () => {
      const permission = 'Notification' in window ? Notification.permission : 'not-supported';
      console.log('📢 Notification permission:', permission);
      setDebugInfo(prev => ({ ...prev, notificationPermission: permission }));
    };

    checkPermission();
  }, []);

  // 6. Tab visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isActive = document.visibilityState === 'visible';
      console.log('👀 Tab visibility changed:', isActive);
      setDebugInfo(prev => ({ ...prev, tabActive: isActive }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const isTabActive = () => {
    return document.visibilityState === 'visible';
  };

  const playNotificationSound = () => {
    console.log('🔊 Attempting to play notification sound...');

    if (!audioRef.current) {
      console.log('❌ Audio ref not available');
      setDebugInfo(prev => ({ ...prev, lastSoundAttempt: 'Audio ref null' }));
      return;
    }

    console.log('🎵 Audio element details:', {
      readyState: audioRef.current.readyState,
      paused: audioRef.current.paused,
      currentSrc: audioRef.current.currentSrc,
      duration: audioRef.current.duration
    });

    audioRef.current.play()
      .then(() => {
        console.log('✅ Sound played successfully');
        setDebugInfo(prev => ({ ...prev, lastSoundAttempt: 'Success' }));
      })
      .catch(err => {
        console.log('❌ Audio play failed:', err);
        console.log('🔍 Audio error details:', {
          name: err.name,
          message: err.message,
          code: err.code
        });
        setDebugInfo(prev => ({ ...prev, lastSoundAttempt: `Failed: ${err.message}` }));
      });
  };

  const showSystemNotification = () => {
    console.log('💬 Attempting to show system notification...');

    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported in this browser');
      return;
    }

    console.log('📢 Current notification permission:', Notification.permission);

    if (Notification.permission === 'granted') {
      const latestUnread = notifications.find(n => !n.is_read);
      if (latestUnread) {
        console.log('✅ Showing system notification:', latestUnread.message);
        new Notification('New Notification', {
          body: latestUnread.message,
          icon: '/favicon.ico'
        });
      }
    } else if (Notification.permission === 'default') {
      console.log('ℹ️ Notification permission not yet granted');
    } else {
      console.log('❌ Notification permission denied');
    }
  };

  const requestNotificationPermission = () => {
    console.log('🔐 Requesting notification permission...');

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('📢 Notification permission result:', permission);
        setDebugInfo(prev => ({ ...prev, notificationPermission: permission }));
      }).catch(err => {
        console.log('❌ Error requesting notification permission:', err);
      });
    } else {
      console.log('ℹ️ Notification permission already set to:', Notification.permission);
    }
  };

  const fetchNotifications = async () => {
    console.log('📡 Fetching notifications...');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: token }
      });
      const newNotifications = res.data;
      console.log('✅ Notifications fetched:', newNotifications.length, 'items');

      setNotifications(newNotifications);

      const newUnreadCount = newNotifications.filter(n => !n.is_read).length;
      console.log('🔢 Unread count:', newUnreadCount);
      setUnreadCount(newUnreadCount);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: token }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: token }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="notification-bell">
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '0',
        background: '#f0f0f0',
        padding: '10px',
        border: '1px solid #ccc',
        fontSize: '12px',
        zIndex: 1000,
        display: isOpen ? 'block' : 'none'
      }}>
        <h5>Debug Info</h5>
        <div>Tab Active: {debugInfo.tabActive ? '✅' : '❌'}</div>
        <div>Permission: {debugInfo.notificationPermission}</div>
        <div>Audio Ready: {debugInfo.audioReady ? '✅' : '❌'}</div>
        <div>Socket: {debugInfo.socketConnected ? '✅' : '❌'}</div>
        <div>Last Sound: {debugInfo.lastSoundAttempt || 'None'}</div>
        <div>Unread: {unreadCount} (Prev: {previousUnreadCount})</div>
      </div>

      {/* Hidden audio element for notification sound */}
      <audio
        ref={audioRef}
        preload="auto"
        onError={(e) => console.log('❌ Audio error event:', e)}
        onLoadStart={() => console.log('🎵 Audio load started')}
        onLoadedData={() => console.log('🎵 Audio loaded data')}
        onCanPlay={() => console.log('🎵 Audio can play')}
      >
        <source src="/notification-sound.mp3" type="audio/mpeg" />
        <source src="/notification-sound.ogg" type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>

      <button
        className="bell-button"
        onClick={() => {
          console.log('🔔 Bell clicked');
          setIsOpen(!isOpen);
          requestNotificationPermission();
        }}
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
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.created_at).toLocaleString()}</small>
                  </div>
                  {!notification.is_read && <div className="unread-dot"></div>}
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