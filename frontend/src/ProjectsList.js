import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProjectsList.css'; // We'll create this CSS file
import Layout from './Layout';

function ProjectsList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        axios.get('http://172.24.109.63:5000/projects', {
            headers: { Authorization: token }
        })
        .then(res => {
            setProjects(res.data);
            setLoading(false);
        })
        .catch(err => navigate('/login'));
    }, [navigate]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        );
    }

    return (
        <Layout>
        <div className="projects-container">
            <div className="projects-header">
                <h2 className="projects-title">All Projects</h2>
                <button 
                    className="add-project-btn"
                    onClick={() => navigate('/add-project')}
                >
                    + Add New Project
                </button>
            </div>
            
            <div className="table-container">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Created By</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="project-row">
                                <td className="project-id">{p.id}</td>
                                <td className="project-name">{p.name}</td>
                                <td className="project-description">{p.description}</td>
                                <td className="project-created-by">{p.created_by}</td>
                                <td className="project-created-at">{new Date(p.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {projects.length === 0 && (
                    <div className="empty-state">
                        <p>No projects found. Create your first project!</p>
                    </div>
                )}
            </div>
        </div>
        </Layout>
    );
}

export default ProjectsList;