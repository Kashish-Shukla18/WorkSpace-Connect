import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TasksPage.css';
import Layout from './Layout';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, completed, high-priority

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://172.24.109.63:5000/api/tasks/assigned', {
                headers: { Authorization: token }
            });
            setTasks(response.data.tasks);
        } catch (err) {
            setError('Failed to fetch tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://172.24.109.63:5000/api/tasks/${taskId}/status`, 
                { status: newStatus },
                { headers: { Authorization: token } }
            );
            
            setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            setError('Failed to update task status');
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return '';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'in_progress': return 'status-in-progress';
            case 'pending': return 'status-pending';
            default: return '';
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'pending') return task.status === 'pending';
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'high-priority') return task.priority === 'high';
        return true;
    });

    if (loading) return <div className="loading">Loading tasks...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
         <Layout>
        <div className="tasks-container">
            <div className="tasks-header">
                <h1>My Assigned Tasks</h1>
                <div className="filters">
                    <button 
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All Tasks
                    </button>
                    <button 
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={filter === 'completed' ? 'active' : ''}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                    <button 
                        className={filter === 'high-priority' ? 'active' : ''}
                        onClick={() => setFilter('high-priority')}
                    >
                        High Priority
                    </button>
                </div>
            </div>

            <div className="tasks-grid">
                {filteredTasks.length === 0 ? (
                    <div className="no-tasks">No tasks found</div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} className="task-card">
                            <div className="task-header">
                                <h3 className="task-title">{task.title}</h3>
                                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </div>
                            
                            <p className="task-description">{task.description}</p>
                            
                            <div className="task-details">
                                <div className="task-detail">
                                    <strong>Due:</strong> {formatDate(task.due_date)}
                                </div>
                                <div className="task-detail">
                                    <strong>Project:</strong> {task.project_name || `Project ${task.project_id}`}
                                </div>
                                <div className="task-detail">
                                    <strong>Created by:</strong> {task.creator_name}
                                </div>
                            </div>

                            <div className="task-actions">
                                <select 
                                    value={task.status} 
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                    className={`status-select ${getStatusClass(task.status)}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                
                                <span className={`status-badge ${getStatusClass(task.status)}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        </Layout>
    );
};

export default TasksPage;