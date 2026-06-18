import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import Layout from './Layout';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: token },
      });
      setProfile(res.data);
      setForm({
        username: res.data.user?.username || '',
        email: res.data.user?.email || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/profile`,
        form,
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message || 'Profile updated');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/profile/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { Authorization: token } }
      );
      setMessage(res.data.message || 'Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><div className="profile-page"><p className="profile-loading">Loading profile...</p></div></Layout>;
  }

  const { user, employee } = profile || {};

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account details and linked employee record.</p>
          </div>
          <Link to="/settings" className="profile-link-btn">Notification Settings →</Link>
        </div>

        {message && <div className="profile-alert success">{message}</div>}
        {error && <div className="profile-alert error">{error}</div>}

        <div className="profile-grid">
          <section className="profile-card profile-identity-card">
            <div className="profile-avatar">
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-identity">
              <h2>{user?.username}</h2>
              <p>{user?.email}</p>
              <span className="profile-since">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </section>

          <section className="profile-card">
            <h3>Account Details</h3>
            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordSave} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-save secondary" disabled={saving}>
                Update Password
              </button>
            </form>
          </section>

          <section className="profile-card">
            <h3>Linked Employee Record</h3>
            {employee ? (
              <div className="linked-employee">
                <p><strong>{employee.first_name} {employee.last_name}</strong></p>
                <p>{employee.role_title || '—'} · {employee.department_name || '—'}</p>
                <p className="muted">{employee.employee_id} · {employee.employment_status}</p>
                <button type="button" onClick={() => navigate(`/employees/${employee.id}`)}>
                  View Employee Profile
                </button>
              </div>
            ) : (
              <p className="profile-empty">
                No employee record matches your account email. HR can link your profile by using the same email in the employee directory.
              </p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
