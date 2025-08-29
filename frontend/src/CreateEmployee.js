import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './CreateEmployee.css';
import axios from 'axios';

const CreateEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        department_id: '',
        role_id: '',
        date_of_joining: '',
        employment_type: 'full_time',
        employment_status: 'active',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://172.24.109.63:5000/api/employees', formData, {
                headers: { Authorization: token }
            });

            if (response.status === 201) {
                navigate('/employees');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create employee');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="create-employee-container">
                <div className="form-header">
                    <h1>Create New Employee</h1>
                    <button onClick={() => navigate('/employees')} className="btn-back">
                        Cancel
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="employee-form">
                    <div className="form-sections">
                        {/* Personal Information */}
                        <div className="form-section">
                            <h3>Personal Information</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Employee ID *</label>
                                    <input
                                        type="text"
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="form-section">
                            <h3>Employment Details</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Department *</label>
                                    <select name="department_id" value={formData.department_id} onChange={handleChange} required>
                                        <option value="">Select Department</option>
                                        <option value="1">Engineering</option>
                                        <option value="2">Human Resources</option>
                                        <option value="3">Marketing</option>
                                        <option value="4">Sales</option>
                                        <option value="5">Finance</option>
                                        <option value="6">Operations</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select name="role_id" value={formData.role_id} onChange={handleChange} required>
                                        <option value="">Select Role</option>
                                        <option value="1">Software Engineer</option>
                                        <option value="2">Senior Software Engineer</option>
                                        <option value="3">HR Manager</option>
                                        <option value="4">Recruiter</option>
                                        <option value="5">Marketing Manager</option>
                                        <option value="6">Sales Executive</option>
                                        <option value="7">Accountant</option>
                                        <option value="8">Operations Manager</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date of Joining *</label>
                                    <input
                                        type="date"
                                        name="date_of_joining"
                                        value={formData.date_of_joining}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Employment Type *</label>
                                    <select name="employment_type" value={formData.employment_type} onChange={handleChange} required>
                                        <option value="full_time">Full Time</option>
                                        <option value="part_time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="intern">Intern</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Employment Status *</label>
                                    <select name="employment_status" value={formData.employment_status} onChange={handleChange} required>
                                        <option value="active">Active</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="terminated">Terminated</option>
                                        <option value="resigned">Resigned</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="form-section">
                            <h3>Address Information</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="form-section">
                            <h3>Emergency Contact</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Contact Name</label>
                                    <input
                                        type="text"
                                        name="emergency_contact_name"
                                        value={formData.emergency_contact_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="emergency_contact_phone"
                                        value={formData.emergency_contact_phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Relation</label>
                                    <input
                                        type="text"
                                        name="emergency_contact_relation"
                                        value={formData.emergency_contact_relation}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/employees')} className="btn-cancel">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? 'Creating...' : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreateEmployee;