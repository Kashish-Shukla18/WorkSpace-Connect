-- Drop existing tables if they exist to avoid conflicts (be careful with this in production!)
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS room_messages CASCADE;
-- DROP TABLE IF EXISTS room_participants CASCADE;
-- DROP TABLE IF EXISTS discussion_rooms CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    priority VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(50),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    date_of_joining DATE,
    employment_type VARCHAR(50) DEFAULT 'full_time',
    employment_status VARCHAR(50) DEFAULT 'active',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    profile_image TEXT,
    image_mime_type VARCHAR(50),
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Messages Table (Direct Messaging)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Discussion Rooms Table
CREATE TABLE discussion_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Room Participants Table
CREATE TABLE room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES discussion_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- 10. Create Room Messages Table
CREATE TABLE room_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES discussion_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default data for departments and roles (Optional)
INSERT INTO departments (name) VALUES ('Engineering'), ('Human Resources'), ('Marketing'), ('Sales'), ('Finance'), ('Operations') ON CONFLICT DO NOTHING;
INSERT INTO roles (title) VALUES ('Software Engineer'), ('HR Manager'), ('Marketing Specialist'), ('Sales Representative'), ('Financial Analyst'), ('Operations Manager') ON CONFLICT DO NOTHING;
