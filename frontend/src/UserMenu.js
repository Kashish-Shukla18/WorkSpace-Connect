import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

function UserMenu({ currentUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="user-menu">
            <button 
                className="user-menu-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                {currentUser?.username || 'User'}
                <span className="dropdown-arrow">▼</span>
            </button>

            {isOpen && (
                <div className="user-dropdown">
                    <div className="user-info">
                        <strong>{currentUser?.username}</strong>
                        <small>{currentUser?.email}</small>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item">
                        Profile Settings
                    </button>
                    
                    <button className="dropdown-item">
                        Notification Preferences
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                        className="dropdown-item logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu;