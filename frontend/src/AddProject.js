import { API_BASE_URL } from './config';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProject.css';
import Layout from './Layout';

function AddProject() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        try {
            await axios.post(`${API_BASE_URL}/projects`, { name, description }, {
                headers: { Authorization: token }
            });
            alert('Project added successfully!');
            navigate('/projects');
        } catch (err) {
            alert(err.response.data.error);
        }
    };

    return (
            <Layout>
        <div className="form-container">
            <form onSubmit={handleSubmit} className="project-form">
                <h2 className="form-title">Add New Project</h2>
                
                <div className="form-group">
                    <input 
                        className="form-input"
                        placeholder="Project Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <textarea 
                        className="form-textarea"
                        placeholder="Project Description" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        rows="4"
                    />
                </div>
                
                <button type="submit" className="submit-btn">Add Project</button>
            </form>
        </div>
        </Layout>
    );
}

export default AddProject;