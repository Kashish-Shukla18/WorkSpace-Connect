import { API_BASE_URL } from './config';
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { AppContext } from './AppContext';

function ProtectedLayout() {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const token = localStorage.getItem('token');

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
        const userRes = await axios.get(`${API_BASE_URL}/api/current-user`, {
          headers: { Authorization: token }
        });
        setCurrentUser(userRes.data);
        localStorage.setItem('user', JSON.stringify({
          name: userRes.data.username,
          email: userRes.data.email,
          id: userRes.data.id,
        }));

        const newSocket = io(`${API_BASE_URL}`, {
          transports: ['websocket', 'polling'],
          reconnection: true,
        });

        newSocket.on('connect', () => {
          setSocketReady(false);
          newSocket.emit('authenticate', token);
        });

        newSocket.on('authenticated', () => {
          setSocketReady(true);
        });

        newSocket.on('unauthorized', () => {
          setSocketReady(false);
        });

        socketRef.current = newSocket;
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
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0c0c0f',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.08)',
          borderTopColor: '#00b4d8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: '#9ba3af', fontSize: '13px', fontFamily: 'inherit' }}>
          Loading workspace...
        </span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppContext.Provider value={{ currentUser, socket, socketReady }}>
      <Outlet />
    </AppContext.Provider>
  );
}

export default ProtectedLayout;
