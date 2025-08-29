import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const mainMenuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/projects', icon: '📁', label: 'Projects' },
        { path: '/tasks', icon: '✅', label: 'My Tasks' },
        { path: '/employees', icon: '👥', label: 'Employees' },
        { path: '/calendar', icon: '📅', label: 'Calendar' },
        { path: '/birthday', icon: '⚙️', label: 'Birthdays' },
        { path: '/chat', icon: '💬', label: 'Chat' },
        { path: '/discussion', icon: '💬', label: 'Discussion' },  // Added Discussion here
    ];

    const projectMenuItems = [
        { path: '/add-project', icon: '➕', label: 'Add Project' },
        { path: '/projects', icon: '👁️', label: 'View Projects' }
    ];

    const taskMenuItems = [
        { path: '/create-task', icon: '➕', label: 'Create Task' },
        { path: '/tasks', icon: '👁️', label: 'View Tasks' }
    ];

    const settingsMenuItems = [
        { path: '/settings', icon: '⚙️', label: 'Settings' },
        { path: '/profile', icon: '👤', label: 'Profile' }
    ];

    const renderMenuSection = (title, items) => (
        <div className="sidebar-section">
            {title && <h4 className="sidebar-section-title">{title}</h4>}
            {items.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={onClose}
                >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                </Link>
            ))}
        </div>
    );

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    {renderMenuSection('Main', mainMenuItems)}
                    {renderMenuSection('Projects', projectMenuItems)}
                    {renderMenuSection('Tasks', taskMenuItems)}
                    {renderMenuSection('Account', settingsMenuItems)}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar-sidebar">
                            {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name-sidebar">
                                {JSON.parse(localStorage.getItem('user') || '{}').name || 'User '}
                            </span>
                            <span className="user-email">
                                {JSON.parse(localStorage.getItem('user') || '{}').email || ''}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
