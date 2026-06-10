import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import Layout from './Layout';
import axios from 'axios';
import './EmployeesPage.css';

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    
    const navigate = useNavigate(); // Add this hook

    useEffect(() => {
        fetchEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.page]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            const response = await axios.get(`${API_BASE_URL}/api/employees?${params}`, {
                headers: { Authorization: token }
            });

            setEmployees(response.data.employees);
            setPagination(response.data.pagination);
        } catch (err) {
            setError('Failed to fetch employees');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleAddEmployee = () => {
        navigate('/employees/create'); // Navigate to create page
    };

    const handleViewEmployee = (employeeId) => {
        navigate(`/employees/${employeeId}`); // Navigate to detail page
    };

    const handleEditEmployee = (employeeId) => {
        navigate(`/employees/edit/${employeeId}`); // Navigate to edit page
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            active: 'status-active',
            on_leave: 'status-on-leave',
            terminated: 'status-terminated',
            resigned: 'status-resigned'
        };
        return `status-badge ${statusClasses[status] || ''}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) return <Layout><div className="loading">Loading employees...</div></Layout>;
    if (error) return <Layout><div className="error">{error}</div></Layout>;

    return (
        <Layout>
            <div className="employees-container">
                <div className="employees-header">
                    <h1>Employee Management</h1>
                    <button className="btn-primary" onClick={handleAddEmployee}>
                        Add Employee
                    </button>
                </div>

                <div className="filters-section">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="search-input"
                    />
                    
                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Departments</option>
                        <option value="1">Engineering</option>
                        <option value="2">Human Resources</option>
                        <option value="3">Marketing</option>
                        <option value="4">Sales</option>
                        <option value="5">Finance</option>
                        <option value="6">Operations</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                        <option value="resigned">Resigned</option>
                    </select>
                </div>

                <div className="employees-table-container">
                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>ID</th>
                                <th>Department</th>
                                <th>Role</th>
                                <th>Join Date</th>
                                <th>Status</th>
                                <th>Age</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(employee => (
                                <tr key={employee.id}>
                                    <td>
                                        <div 
                                            className="employee-info clickable"
                                            onClick={() => handleViewEmployee(employee.id)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <div className="employee-avatar">
                                                {employee.profile_image ? (
                                                    <img 
                                                        src={employee.profile_image} 
                                                        alt={`${employee.first_name} ${employee.last_name}`}
                                                    />
                                                ) : (
                                                    <span>{employee.first_name.charAt(0)}{employee.last_name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="employee-details">
                                                <div className="employee-name">
                                                    {employee.first_name} {employee.last_name}
                                                </div>
                                                <div className="employee-email">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{employee.employee_id}</td>
                                    <td>{employee.department_name}</td>
                                    <td>{employee.role_title}</td>
                                    <td>{formatDate(employee.date_of_joining)}</td>
                                    <td>
                                        <span className={getStatusBadge(employee.employment_status)}>
                                            {employee.employment_status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{calculateAge(employee.date_of_birth)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-view"
                                                onClick={() => handleViewEmployee(employee.id)}
                                            >
                                                View
                                            </button>
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditEmployee(employee.id)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button 
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </button>
                    
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    
                    <button 
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default EmployeesPage;