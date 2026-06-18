import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import Layout from './Layout';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    desktop_notifications: true,
    sound_enabled: true,
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings`, {
          headers: { Authorization: token },
        });
        setUser(res.data.user);
        if (res.data.notifications) {
          setNotifications({
            email_notifications: !!res.data.notifications.email_notifications,
            push_notifications: !!res.data.notifications.push_notifications,
            desktop_notifications: !!res.data.notifications.desktop_notifications,
            sound_enabled: !!res.data.notifications.sound_enabled,
          });
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate, token]);

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/settings`,
        notifications,
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message || 'Settings saved');
      if (res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><div className="settings-page"><p className="settings-loading">Loading settings...</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Configure notifications and workspace preferences for {user?.username}.</p>
          </div>
          <Link to="/profile" className="settings-link-btn">Edit Profile →</Link>
        </div>

        {message && <div className="settings-alert success">{message}</div>}
        {error && <div className="settings-alert error">{error}</div>}

        <form onSubmit={handleSave} className="settings-form">
          <section className="settings-card">
            <h2>Notifications</h2>
            <p className="settings-desc">Choose how you want to be notified about tasks, messages, and updates.</p>

            <label className="settings-toggle">
              <div>
                <strong>Email notifications</strong>
                <span>Receive updates by email</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_notifications}
                onChange={() => handleToggle('email_notifications')}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Push notifications</strong>
                <span>Browser push alerts when supported</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.push_notifications}
                onChange={() => handleToggle('push_notifications')}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Desktop notifications</strong>
                <span>Show in-app notification toasts</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.desktop_notifications}
                onChange={() => handleToggle('desktop_notifications')}
              />
            </label>

            <label className="settings-toggle">
              <div>
                <strong>Sound alerts</strong>
                <span>Play a sound for new notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.sound_enabled}
                onChange={() => handleToggle('sound_enabled')}
              />
            </label>
          </section>

          <section className="settings-card">
            <h2>Quick Links</h2>
            <div className="settings-links">
              <button type="button" onClick={() => navigate('/profile')}>Account & Password</button>
              <button type="button" onClick={() => navigate('/tasks')}>My Tasks</button>
              <button type="button" onClick={() => navigate('/discussion')}>Discussion Rooms</button>
            </div>
          </section>

          <button type="submit" className="settings-save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
