import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './EditEmployee.css';
import axios from 'axios';

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
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

    useEffect(() => {
        fetchEmployee();
        fetchDropdownData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchDropdownData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch departments and roles for dropdowns
            const [deptResponse, rolesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/departments`, {
                    headers: { Authorization: token }
                }),
                axios.get(`${API_BASE_URL}/api/roles`, {
                    headers: { Authorization: token }
                })
            ]);

            setDepartments(Array.isArray(deptResponse.data) ? deptResponse.data : deptResponse.data.departments || []);
            setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : rolesResponse.data.roles || []);
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
        }
    };

    const fetchEmployee = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication required. Please log in again.');
                setLoading(false);
                navigate('/login');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const employeeData = response.data.employee;
            setFormData({
                employee_id: employeeData.employee_id || '',
                first_name: employeeData.first_name || '',
                last_name: employeeData.last_name || '',
                email: employeeData.email || '',
                phone: employeeData.phone || '',
                date_of_birth: employeeData.date_of_birth ? employeeData.date_of_birth.split('T')[0] : '',
                gender: employeeData.gender || '',
                department_id: employeeData.department_id ? employeeData.department_id.toString() : '',
                role_id: employeeData.role_id ? employeeData.role_id.toString() : '',
                date_of_joining: employeeData.date_of_joining ? employeeData.date_of_joining.split('T')[0] : '',
                employment_type: employeeData.employment_type || 'full_time',
                employment_status: employeeData.employment_status || 'active',
                address: employeeData.address || '',
                city: employeeData.city || '',
                state: employeeData.state || '',
                country: employeeData.country || '',
                postal_code: employeeData.postal_code || '',
                emergency_contact_name: employeeData.emergency_contact_name || '',
                emergency_contact_phone: employeeData.emergency_contact_phone || '',
                emergency_contact_relation: employeeData.emergency_contact_relation || ''
            });
        } catch (err) {
            console.error('Error fetching employee:', err);
            
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else if (err.response?.status === 404) {
                setError('Employee not found.');
            } else {
                setError('Failed to fetch employee details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication required. Please log in again.');
                navigate('/login');
                return;
            }
            
            // Validate required fields
            if (!formData.employee_id || !formData.first_name || !formData.last_name || 
                !formData.email || !formData.date_of_birth || !formData.department_id || 
                !formData.role_id || !formData.date_of_joining) {
                setError('Please fill in all required fields');
                setSaving(false);
                return;
            }

            const updateData = {
                ...formData,
                department_id: formData.department_id ? parseInt(formData.department_id) : null,
                role_id: formData.role_id ? parseInt(formData.role_id) : null
            };

            const response = await axios.put(`${API_BASE_URL}/api/employees/${id}`, updateData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                navigate(`/employees/${id}`, { 
                    state: { message: 'Employee updated successfully!' } 
                });
            }
        } catch (err) {
            console.error('Error updating employee:', err);
            
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else if (err.response?.status === 400) {
                setError(err.response.data.error || 'Validation error. Please check your input.');
            } else if (err.response?.status === 409) {
                setError('Employee ID or email already exists.');
            } else {
                setError(err.response?.data?.error || 'Failed to update employee. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="loading">Loading employee...</div></Layout>;
    
    return (
        <Layout>
            <div className="edit-employee-container">
                <div className="form-header">
                    <h1>Edit Employee</h1>
                    <button onClick={() => navigate(`/employees/${id}`)} className="btn-back">
                        Back to Employee
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
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
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={saving}
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
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select 
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleChange}
                                        disabled={saving}
                                    >
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
                                    <select 
                                        name="department_id" 
                                        value={formData.department_id} 
                                        onChange={handleChange} 
                                        required
                                        disabled={saving}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select 
                                        name="role_id" 
                                        value={formData.role_id} 
                                        onChange={handleChange} 
                                        required
                                        disabled={saving}
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.title}
                                            </option>
                                        ))}
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
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Employment Type *</label>
                                    <select 
                                        name="employment_type" 
                                        value={formData.employment_type} 
                                        onChange={handleChange} 
                                        required
                                        disabled={saving}
                                    >
                                        <option value="full_time">Full Time</option>
                                        <option value="part_time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="intern">Intern</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Employment Status *</label>
                                    <select 
                                        name="employment_status" 
                                        value={formData.employment_status} 
                                        onChange={handleChange} 
                                        required
                                        disabled={saving}
                                    >
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
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        disabled={saving}
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
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="emergency_contact_phone"
                                        value={formData.emergency_contact_phone}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Relation</label>
                                    <input
                                        type="text"
                                        name="emergency_contact_relation"
                                        value={formData.emergency_contact_relation}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate(`/employees/${id}`)} 
                            className="btn-cancel"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="btn-submit"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default EditEmployee;