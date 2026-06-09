import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateTask.css';
import Layout from './Layout';

function CreateTask() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [projectId, setProjectId] = useState('');
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        // Fetch users and projects
        Promise.all([
            axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: token }
            }),
            axios.get(`${API_BASE_URL}/projects`, {
                headers: { Authorization: token }
            })
        ])
        .then(([usersRes, projectsRes]) => {
            setUsers(usersRes.data);
            setProjects(projectsRes.data);
        })
        .catch(err => console.error('Error fetching data:', err));
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!projectId) {
            alert('Please select a project');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/tasks`, {
                title,
                description,
                due_date: dueDate,
                priority,
                assigned_to: assignedTo,
                project_id: projectId
            }, {
                headers: { Authorization: token }
            });

            alert('Task created and assigned successfully!');
            navigate('/tasks');
        } catch (err) {
            alert(err.response?.data?.error || 'Error creating task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
        <div className="form-container">
            <form onSubmit={handleSubmit} className="task-form">
                <h2 className="form-title">Create New Task</h2>
                
                {/* Project Selection */}
                <div className="form-group">
                    <label>Select Project</label>
                    <select 
                        className="form-select"
                        value={projectId}
                        onChange={e => setProjectId(e.target.value)}
                        required
                    >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name} - Created by: {project.created_by}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <input 
                        className="form-input"
                        placeholder="Task Title" 
                        value={title}
                        onChange={e => setTitle(e.target.value)} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <textarea 
                        className="form-textarea"
                        placeholder="Task Description" 
                        value={description}
                        onChange={e => setDescription(e.target.value)} 
                        rows="4"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Due Date</label>
                        <input 
                            type="datetime-local"
                            className="form-input"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <select 
                            className="form-select"
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Assign To User</label>
                    <select 
                        className="form-select"
                        value={assignedTo}
                        onChange={e => setAssignedTo(e.target.value)}
                        required
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username} - {user.email}
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Creating Task...' : 'Create Task'}
                </button>
            </form>
        </div>
        </Layout>
    );
}

export default CreateTask;