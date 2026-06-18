import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import Layout from './Layout';
import './Birthday.css';

export default function WishesPage() {
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [todayDate, setTodayDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishMessages, setWishMessages] = useState({});
  const [sentWishes, setSentWishes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get(`${API_BASE_URL}/api/birthdays`, {
          headers: { Authorization: token },
        });

        setTodayBirthdays(res.data.today || []);
        setUpcomingBirthdays(res.data.upcoming || []);
        setTodayDate(res.data.todayDate || new Date().toISOString().split('T')[0]);
      } catch (err) {
        console.error(err);
        setError('Failed to load birthday data');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [navigate]);

  const sendWish = async (employee) => {
    const defaultText = `Happy Birthday ${employee.first_name}! Wishing you a wonderful day from the whole team. 🎉`;
    const text = wishMessages[employee.id] || defaultText;

    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      await axios.post(
        `${API_BASE_URL}/send-email`,
        { to: employee.email, subject: '🎂 Happy Birthday!', text },
        { headers: { Authorization: token } }
      );

      setSentWishes((prev) => ({ ...prev, [employee.id]: true }));
    } catch (err) {
      alert(`Failed to send wish: ${err.response?.data?.error || err.message}`);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="wishes-container">
          <p className="loading">Loading birthdays...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="wishes-container">
        <h1 className="wishes-header">🎉 Birthday Wishes</h1>
        <p className="birthday-today-label">
          Today: <strong>{new Date(todayDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
        </p>

        {error && <div className="birthday-error">{error}</div>}

        <div className="birthdays-list">
          <div className="birthdays-header">Today&apos;s Birthdays 🎂</div>
          {todayBirthdays.length > 0 ? (
            todayBirthdays.map((emp) => (
              <div key={emp.id} className="employee-card">
                <div className="employee-info">
                  <span>{emp.first_name} {emp.last_name}</span>
                  <span className="employee-email">{emp.email}</span>
                  <span className="employee-meta">{emp.department_name || 'No department'} · Turns {new Date().getFullYear() - new Date(emp.date_of_birth).getFullYear()} today</span>
                </div>
                <div className="birthday-actions">
                  <textarea
                    className="wish-textarea"
                    placeholder={`Write a personal message for ${emp.first_name}...`}
                    value={wishMessages[emp.id] || ''}
                    onChange={(e) => setWishMessages({ ...wishMessages, [emp.id]: e.target.value })}
                    rows={2}
                  />
                  <div className="birthday-action-buttons">
                    <Link to={`/employees/${emp.id}`} className="view-employee-btn">View Profile</Link>
                    <button
                      className="wish-button"
                      onClick={() => sendWish(emp)}
                      disabled={sentWishes[emp.id]}
                    >
                      {sentWishes[emp.id] ? 'Wish Sent ✓' : 'Send Wish'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-birthdays-inline">No birthdays today — check upcoming celebrations below.</p>
          )}
        </div>

        <div className="birthdays-list upcoming-list">
          <div className="birthdays-header">Upcoming (next 30 days)</div>
          {upcomingBirthdays.length > 0 ? (
            upcomingBirthdays.map((emp) => (
              <div key={emp.id} className="employee-card upcoming-card">
                <div className="employee-info">
                  <span>{emp.first_name} {emp.last_name}</span>
                  <span className="employee-email">{formatDisplayDate(emp.date_of_birth)} · in {emp.daysUntil} day{emp.daysUntil !== 1 ? 's' : ''}</span>
                  <span className="employee-meta">{emp.department_name || 'No department'}</span>
                </div>
                <Link to={`/employees/${emp.id}`} className="view-employee-btn">View Profile</Link>
              </div>
            ))
          ) : (
            <p className="no-birthdays-inline">No upcoming birthdays in the next 30 days.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
