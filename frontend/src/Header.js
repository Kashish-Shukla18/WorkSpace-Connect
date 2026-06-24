import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import NotificationBell from './NotificationBell';
import { useApp } from './AppContext';

const Header = () => {
    const navigate = useNavigate();
    const { currentUser } = useApp();

    const storedUser = localStorage.getItem('user');
    let user = currentUser;
    if (!user && storedUser) {
        try {
            user = JSON.parse(storedUser);
        } catch {
            user = null;
        }
    }

    const displayName = user?.username || user?.name || 'Guest';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/dashboard" className="logo">
                    <h2>ProjectManager</h2>
                </Link>
            </div>

            <div className="header-center">
                <nav className="nav">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/projects" className="nav-link">Projects</Link>
                    <Link to="/tasks" className="nav-link">Tasks</Link>
                    <Link to="/employees" className="nav-link">Employees</Link>
                </nav>
            </div>

            <div className="header-right">
                <NotificationBell />
                <div className="user-menu">
                    <span className="user-name">Hello, {displayName}</span>
                    <div className="dropdown">
                        <button className="dropdown-toggle" type="button">
                            <span className="user-avatar">{avatarLetter}</span>
                        </button>
                        <div className="dropdown-menu">
                            <Link to="/profile" className="dropdown-item">Profile</Link>
                            <Link to="/settings" className="dropdown-item">Settings</Link>
                            <button onClick={handleLogout} className="dropdown-item logout" type="button">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
