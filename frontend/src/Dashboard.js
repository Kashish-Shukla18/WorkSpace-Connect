// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState({ name: 'Professional' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <Layout>
            <div className="dashboard-wrapper">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>Overview</h1>
                        <p>Welcome back, {user.name || 'Professional'}. Here's what's happening with your projects today.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-primary">Generate Report</button>
                        <button className="btn-secondary">Settings</button>
                    </div>
                </div>

                <div className="dashboard-metrics">
                    <div className="metric-card">
                        <div className="metric-icon primary">
                            📈
                        </div>
                        <div className="metric-details">
                            <h3>Total Revenue</h3>
                            <p className="metric-value">$124,563.00</p>
                            <span className="metric-trend positive">+14% from last month</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon success">
                            🚀
                        </div>
                        <div className="metric-details">
                            <h3>Active Projects</h3>
                            <p className="metric-value">42</p>
                            <span className="metric-trend positive">+5 new this week</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon warning">
                            ⏳
                        </div>
                        <div className="metric-details">
                            <h3>Pending Tasks</h3>
                            <p className="metric-value">18</p>
                            <span className="metric-trend negative">-2 from yesterday</span>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon info">
                            👥
                        </div>
                        <div className="metric-details">
                            <h3>Team Members</h3>
                            <p className="metric-value">24</p>
                            <span className="metric-trend neutral">No changes</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <h2>Recent Activity</h2>
                        </div>
                        <div className="panel-content activity-list">
                            <div className="activity-item">
                                <div className="activity-dot blue"></div>
                                <div className="activity-text">
                                    <p><strong>Sarah Jenkins</strong> updated the <em>Q3 Marketing Proposal</em></p>
                                    <span>2 hours ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-dot green"></div>
                                <div className="activity-text">
                                    <p><strong>David Chen</strong> completed task <em>Server Migration</em></p>
                                    <span>5 hours ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-dot yellow"></div>
                                <div className="activity-text">
                                    <p>New project <em>Alpha Redesign</em> was created</p>
                                    <span>Yesterday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <h2>Upcoming Deadlines</h2>
                        </div>
                        <div className="panel-content deadlines-list">
                            <div className="deadline-item">
                                <div className="deadline-info">
                                    <h4>Q3 Financial Audit</h4>
                                    <p>Finance Team</p>
                                </div>
                                <div className="deadline-date urgent">
                                    Tomorrow
                                </div>
                            </div>
                            <div className="deadline-item">
                                <div className="deadline-info">
                                    <h4>Product Launch V2</h4>
                                    <p>Engineering & Marketing</p>
                                </div>
                                <div className="deadline-date">
                                    Oct 15, 2026
                                </div>
                            </div>
                            <div className="deadline-item">
                                <div className="deadline-info">
                                    <h4>Client Onboarding - Acme Corp</h4>
                                    <p>Sales Team</p>
                                </div>
                                <div className="deadline-date">
                                    Oct 18, 2026
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;