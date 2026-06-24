import { API_BASE_URL } from './config';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const res = await axios.post(`${API_BASE_URL}/login`, { username, password });
            localStorage.setItem('token', res.data.token);

            const userRes = await axios.get(`${API_BASE_URL}/api/current-user`, {
              headers: { Authorization: res.data.token },
            });
            localStorage.setItem('user', JSON.stringify({
              name: userRes.data.username,
              email: userRes.data.email,
              id: userRes.data.id,
            }));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account to continue</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username or Email</label>
                        <input 
                            id="username"
                            type="text" 
                            placeholder="Enter your username or email" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder="Enter your password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
                
                <div className="signup-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
                
                
            </div>
        </div>
    );
}

export default Login;