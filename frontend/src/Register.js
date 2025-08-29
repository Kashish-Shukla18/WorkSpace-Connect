import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setIsLoading(true);
        
        try {
            await axios.post('http://172.24.109.63:5000/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h2>Create Account</h2>
                    <p>Join us to get started</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input 
                            id="username"
                            name="username"
                            type="text" 
                            placeholder="Choose a username" 
                            value={formData.username} 
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            id="email"
                            name="email"
                            type="email" 
                            placeholder="Enter your email" 
                            value={formData.email} 
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            name="password"
                            type="password" 
                            placeholder="Create a password" 
                            value={formData.password} 
                            onChange={handleChange}
                            required
                        />
                        <div className="password-strength">
                            <div className={`strength-bar ${formData.password.length > 0 ? 'weak' : ''} ${formData.password.length >= 6 ? 'fair' : ''} ${formData.password.length >= 8 ? 'good' : ''} ${formData.password.length >= 10 ? 'strong' : ''}`}></div>
                            <span className="strength-text">
                                {formData.password.length === 0 ? '' : 
                                 formData.password.length < 6 ? 'Weak' : 
                                 formData.password.length < 8 ? 'Fair' : 
                                 formData.password.length < 10 ? 'Good' : 'Strong'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password" 
                            placeholder="Confirm your password" 
                            value={formData.confirmPassword} 
                            onChange={handleChange}
                            required
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <span className="password-match-error">Passwords don't match</span>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <span className="password-match-success">Passwords match</span>
                        )}
                    </div>
                    
                    <div className="terms-agreement">
                        <label className="terms-checkbox">
                            <input type="checkbox" required />
                            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>
                
                <div className="login-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;