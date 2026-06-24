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

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/create-task" element={<CreateTask />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/create" element={<CreateEmployee />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/employees/edit/:id" element={<EditEmployee />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/birthday" element={<BirthDay />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/discussion" element={<DiscussionRoomPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
