import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './EmployeeDetails.css';
import axios from 'axios';

const EmployeeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEmployee();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
                headers: { Authorization: token }
            });
            setEmployee(response.data.employee);
        } catch (err) {
            setError('Failed to fetch employee details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        return today.getFullYear() - birthDate.getFullYear();
    };

    if (loading) return <Layout><div className="loading">Loading employee details...</div></Layout>;
    if (error) return <Layout><div className="error">{error}</div></Layout>;
    if (!employee) return <Layout><div className="error">Employee not found</div></Layout>;

    return (
        <Layout>
            <div className="employee-details-container">
                <div className="details-header">
                    <button onClick={() => navigate('/employees')} className="back-button">
                        ← Back to Employees
                    </button>
                    <h1>Employee Details</h1>
                    <div className="header-actions">
                        <button className="btn-edit">Edit Employee</button>
                        <button className="btn-delete">Delete</button>
                    </div>
                </div>

                <div className="employee-profile">
                    <div className="profile-image">
                        {employee.profile_image ? (
                            <img src={employee.profile_image} alt={`${employee.first_name} ${employee.last_name}`} />
                        ) : (
                            <div className="avatar-placeholder">
                                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info">
                        <h2>{employee.first_name} {employee.last_name}</h2>
                        <p className="employee-id">ID: {employee.employee_id}</p>
                        <p className="employee-email">{employee.email}</p>
                        <p className="employee-phone">{employee.phone}</p>
                    </div>

                    <div className="status-badge">
                        <span className={`status ${employee.employment_status}`}>
                            {employee.employment_status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="details-grid">
                    <div className="detail-section">
                        <h3>Personal Information</h3>
                        <div className="detail-row">
                            <span className="label">Date of Birth:</span>
                            <span className="value">{formatDate(employee.date_of_birth)} ({calculateAge(employee.date_of_birth)} years)</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Gender:</span>
                            <span className="value">{employee.gender}</span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Employment Details</h3>
                        <div className="detail-row">
                            <span className="label">Department:</span>
                            <span className="value">{employee.department_name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Role:</span>
                            <span className="value">{employee.role_title}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Date of Joining:</span>
                            <span className="value">{formatDate(employee.date_of_joining)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Employment Type:</span>
                            <span className="value">{employee.employment_type?.replace('_', ' ')}</span>
                        </div>
                        {employee.termination_date && (
                            <div className="detail-row">
                                <span className="label">Termination Date:</span>
                                <span className="value">{formatDate(employee.termination_date)}</span>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Contact Information</h3>
                        <div className="detail-row">
                            <span className="label">Address:</span>
                            <span className="value">{employee.address}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">City:</span>
                            <span className="value">{employee.city}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">State:</span>
                            <span className="value">{employee.state}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Country:</span>
                            <span className="value">{employee.country}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Postal Code:</span>
                            <span className="value">{employee.postal_code}</span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Emergency Contact</h3>
                        <div className="detail-row">
                            <span className="label">Name:</span>
                            <span className="value">{employee.emergency_contact_name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Phone:</span>
                            <span className="value">{employee.emergency_contact_phone}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Relation:</span>
                            <span className="value">{employee.emergency_contact_relation}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmployeeDetails;