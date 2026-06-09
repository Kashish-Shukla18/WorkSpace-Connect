import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

function ProtectedLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
useEffect(() => {
  if (socket && currentUser) {
    // Listen for new notifications
    socket.on('newNotification', (notification) => {
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png'
        });
      }
      
      // Play sound
      playNotificationSound();
    });

    return () => {
      socket.off('newNotification');
    };
  }
}, [socket, currentUser]);

const playNotificationSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(() => {});
};

// Request notification permission
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const initializeApp = async () => {
      try {
        // Fetch current user
        const userRes = await axios.get(`${API_BASE_URL}/api/current-user`, {
          headers: { Authorization: token }
        });
        setCurrentUser(userRes.data);

        // Create socket and authenticate immediately
        const newSocket = io(`${API_BASE_URL}`);
        
        newSocket.on('connect', () => {
          console.log('Socket connected, sending authentication...');
          newSocket.emit('authenticate', token);
        });

        // Set socket immediately (we'll handle authentication separately)
        setSocket(newSocket);
        
      } catch (err) {
        console.error('Error initializing app:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return React.Children.map(children, child => 
    React.cloneElement(child, { currentUser, socket })
  );
}

export default ProtectedLayout;