import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import Layout from './Layout';
import './Dashboard.css';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const formatDeadlineLabel = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Overdue';
  return due.toLocaleDateString();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
          headers: { Authorization: token },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-wrapper">
          <div className="dashboard-loading">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="dashboard-wrapper">
          <div className="dashboard-error">{error || 'No data available'}</div>
        </div>
      </Layout>
    );
  }

  const { user, metrics, recentActivity, upcomingDeadlines } = stats;

  return (
    <Layout>
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Overview</h1>
            <p>
              Welcome back, {user?.username || 'there'}. Here&apos;s what&apos;s happening in your workspace today.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => navigate('/tasks')}>
              View My Tasks
            </button>
            <button className="btn-secondary" onClick={() => navigate('/settings')}>
              Settings
            </button>
          </div>
        </div>

        <div className="dashboard-metrics">
          <div className="metric-card" onClick={() => navigate('/projects')} role="button" tabIndex={0}>
            <div className="metric-icon primary">📁</div>
            <div className="metric-details">
              <h3>My Projects</h3>
              <p className="metric-value">{metrics.myProjects}</p>
              <span className="metric-trend neutral">{metrics.totalProjects} total in workspace</span>
            </div>
          </div>
          <div className="metric-card" onClick={() => navigate('/tasks')} role="button" tabIndex={0}>
            <div className="metric-icon warning">⏳</div>
            <div className="metric-details">
              <h3>Pending Tasks</h3>
              <p className="metric-value">{metrics.pendingTasks}</p>
              <span className="metric-trend neutral">Assigned to you</span>
            </div>
          </div>
          <div className="metric-card" onClick={() => navigate('/employees')} role="button" tabIndex={0}>
            <div className="metric-icon info">👥</div>
            <div className="metric-details">
              <h3>Active Employees</h3>
              <p className="metric-value">{metrics.teamMembers}</p>
              <span className="metric-trend neutral">Team directory</span>
            </div>
          </div>
          <div className="metric-card" onClick={() => navigate('/birthday')} role="button" tabIndex={0}>
            <div className="metric-icon success">🔔</div>
            <div className="metric-details">
              <h3>Notifications</h3>
              <p className="metric-value">{metrics.unreadNotifications}</p>
              <span className="metric-trend neutral">Unread alerts</span>
            </div>
          </div>
        </div>

        <div className="dashboard-quick-actions">
          <button onClick={() => navigate('/add-project')}>+ New Project</button>
          <button onClick={() => navigate('/create-task')}>+ New Task</button>
          <button onClick={() => navigate('/employees/create')}>+ Add Employee</button>
          <button onClick={() => navigate('/discussion')}>Open Discussions</button>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="panel-content activity-list">
              {recentActivity.length === 0 ? (
                <p className="panel-empty">No recent activity yet. Create a project or task to get started.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className={`activity-dot ${item.type === 'task' ? 'green' : 'blue'}`} />
                    <div className="activity-text">
                      <p dangerouslySetInnerHTML={{ __html: item.message }} />
                      {item.project && <span className="activity-meta">{item.project}</span>}
                      <span>{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Upcoming Deadlines</h2>
            </div>
            <div className="panel-content deadlines-list">
              {upcomingDeadlines.length === 0 ? (
                <p className="panel-empty">No upcoming deadlines. You&apos;re all caught up.</p>
              ) : (
                upcomingDeadlines.map((task) => {
                  const label = formatDeadlineLabel(task.due_date);
                  const isUrgent = label === 'Today' || label === 'Tomorrow' || label === 'Overdue';
                  return (
                    <div key={task.id} className="deadline-item" onClick={() => navigate('/tasks')} role="button" tabIndex={0}>
                      <div className="deadline-info">
                        <h4>{task.title}</h4>
                        <p>{task.project_name || 'No project'} · {task.priority || 'normal'} priority</p>
                      </div>
                      <div className={`deadline-date ${isUrgent ? 'urgent' : ''}`}>{label}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
