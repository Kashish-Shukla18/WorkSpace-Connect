import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import AddProject from './AddProject';
import ProjectsList from './ProjectsList';
import CreateTask from './CreateTask';
import TasksPage from './TasksPage';
import EmployeesPage from './EmployeesPage';
import EmployeeDetails from './EmployeeDetails';
import EditEmployee from './EditEmployee';
import CreateEmployee from './CreateEmployee';
import Calendar from './Calendar';
import BirthDay from './Birthday';
import ChatPage from './ChatPage';
import DiscussionRoomPage from './DiscussionRoomPage';
import Profile from './Profile';
import Settings from './Settings';
import ProtectedLayout from './ProtectedLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        } />
        <Route path="/add-project" element={
          <ProtectedLayout>
            <AddProject />
          </ProtectedLayout>
        } />
        <Route path="/projects" element={
          <ProtectedLayout>
            <ProjectsList />
          </ProtectedLayout>
        } />
        <Route path="/create-task" element={
          <ProtectedLayout>
            <CreateTask />
          </ProtectedLayout>
        } />
        <Route path="/tasks" element={
          <ProtectedLayout>
            <TasksPage />
          </ProtectedLayout>
        } />
        <Route path="/employees" element={
          <ProtectedLayout>
            <EmployeesPage />
          </ProtectedLayout>
        } />
        <Route path="/employees/create" element={
          <ProtectedLayout>
            <CreateEmployee />
          </ProtectedLayout>
        } />
        <Route path="/employees/:id" element={
          <ProtectedLayout>
            <EmployeeDetails />
          </ProtectedLayout>
        } />
        <Route path="/employees/edit/:id" element={
          <ProtectedLayout>
            <EditEmployee />
          </ProtectedLayout>
        } />
        <Route path="/calendar" element={
          <ProtectedLayout>
            <Calendar />
          </ProtectedLayout>
        } />
        <Route path="/birthday" element={
          <ProtectedLayout>
            <BirthDay />
          </ProtectedLayout>
        } />
        <Route path="/chat" element={
          <ProtectedLayout>
            <ChatPage />
          </ProtectedLayout>
        } />
        <Route path="/discussion" element={
          <ProtectedLayout>
            <DiscussionRoomPage />
          </ProtectedLayout>
        } />
        <Route path="/profile" element={
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        } />
        <Route path="/settings" element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;