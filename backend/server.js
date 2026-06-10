const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
    ? { rejectUnauthorized: false }
    : false
});

// Catch unhandled errors on the pool to prevent server crashes
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
// const nodemailer = require('nodemailer');

// // Create transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });
// transporter.verify((err, success) => {
//   if (err) console.error("Email transporter error:", err);
//   else console.log("Email transporter ready");
// });

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Secret key for JWT
const SECRET = 'mysecretkey';

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Auth routes
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 8);
    const result = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id',
      [username, hashedPassword, email]
    );
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(400).json({ error: 'User already exists or DB error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (user.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.rows[0].id }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard route (protected)
app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT username FROM users WHERE id=$1', [req.userId]);
    res.json({ message: `Welcome ${user.rows[0].username} to your dashboard` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Project routes
app.post('/projects', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }
  try {
    await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3)',
      [name, description, req.userId]
    );
    res.json({ message: 'Project added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await pool.query('SELECT id, username ,email FROM users');
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT p.id, p.name, p.description, u.username as created_by, p.created_at
             FROM projects p
             JOIN users u ON p.created_by = u.id
             ORDER BY p.created_at DESC`
    );
    res.json(projects.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Task routes
app.get('/api/tasks/assigned', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT 
    t.*,
    p.name as project_name,
    u.username as creator_name
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN users u ON t.created_by = u.id
WHERE t.assigned_to = $1
ORDER BY t.due_date ASC, t.priority DESC
        `, [req.userId]);

    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/tasks/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND assigned_to = $2',
      [id, req.userId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }

    const result = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({ message: 'Task status updated', task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/tasks', authMiddleware, async (req, res) => {
  const { title, description, due_date, priority, assigned_to, project_id } = req.body;
  console.log("Request body:", req.body);

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority, assigned_to, project_id, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, due_date, priority, assigned_to, project_id, req.userId]
    );

    const task = result.rows[0];
    console.log("Task created:", task);

    const userResult = await pool.query('SELECT username, email FROM users WHERE id=$1', [assigned_to]);
    if (userResult.rows.length > 0) {
      const assignedUser = userResult.rows[0];

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: assignedUser.email,
          subject: `New Task Assigned: ${title}`,
          text: `Hi ${assignedUser.username},\n\nYou have been assigned a new task: "${title}".\nDescription: ${description}\nDue Date: ${due_date}\nPriority: ${priority}\n\nPlease check your dashboard for more details.`
        });
        console.log(`Email sent successfully to ${assignedUser.email}`);
      } catch (emailErr) {
        console.error("Error sending email:", emailErr);
      }
    } else {
      console.log("Assigned user not found in DB");
    }

    res.json({ message: 'Task created successfully (email attempt logged)', task });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Employee routes
app.get('/api/employees', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
    SELECT 
        e.*,
        d.name as department_name,
        r.title as role_title
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN roles r ON e.role_id = r.id
    WHERE 1=1
`;
    let params = [];
    let paramCount = 0;

    if (department) {
      paramCount++;
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department);
    }

    if (status) {
      paramCount++;
      query += ` AND e.employment_status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (
                e.first_name ILIKE $${paramCount} OR 
                e.last_name ILIKE $${paramCount} OR 
                e.email ILIKE $${paramCount} OR
                e.employee_id ILIKE $${paramCount}
            )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = `SELECT COUNT(*) FROM employees e WHERE 1=1`;
    let countParams = [];
    let countParamCount = 0;

    if (department) {
      countParamCount++;
      countQuery += ` AND e.department_id = $${countParamCount}`;
      countParams.push(department);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND e.employment_status = $${countParamCount}`;
      countParams.push(status);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (
                e.first_name ILIKE $${countParamCount} OR 
                e.last_name ILIKE $${countParamCount} OR 
                e.email ILIKE $${countParamCount} OR
                e.employee_id ILIKE $${countParamCount}
            )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      employees: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/employees', authMiddleware, async (req, res) => {
  console.log("Incoming Employee Data:", req.body);

  try {
    const {
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      department_id,
      role_id,
      date_of_joining,
      employment_type,
      employment_status,
      address,
      city,
      state,
      country,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation
    } = req.body;

    const departmentIdInt = department_id ? parseInt(department_id) : null;
    const roleIdInt = role_id ? parseInt(role_id) : null;

    const result = await pool.query(`
            INSERT INTO employees (
                employee_id, first_name, last_name, email, phone, date_of_birth, gender,
                department_id, role_id, date_of_joining, employment_type, employment_status,
                address, city, state, country, postal_code,
                emergency_contact_name, emergency_contact_phone, emergency_contact_relation
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING *
        `, [
      employee_id, first_name, last_name, email, phone, date_of_birth, gender,
      departmentIdInt, roleIdInt, date_of_joining, employment_type, employment_status,
      address, city, state, country, postal_code,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation
    ]);

    res.status(201).json({
      message: 'Employee created successfully',
      employee: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Employee ID or Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

app.get('/api/employees/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
            SELECT 
                e.*,
                d.name as department_name,
                r.title as role_title
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN roles r ON e.role_id = r.id
            WHERE e.id = $1
        `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee: result.rows[0] });
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/employees/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = Object.values(updates);
    values.push(id);
    values.push(req.userId);

    const result = await pool.query(`
            UPDATE employees 
            SET ${setClause}, updated_by = $${values.length}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${values.length - 1}
            RETURNING *
        `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/employees/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/employees/:id/upload-image', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, mimeType } = req.body;

    const result = await pool.query(`
            UPDATE employees 
            SET profile_image = $1, image_mime_type = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `, [imageUrl, mimeType, req.userId, id]);

    res.json({
      message: 'Image uploaded successfully',
      employee: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Message routes
app.get("/messages/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id=$1 AND receiver_id=$2) 
          OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY created_at ASC`,
      [req.userId, userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Email sending route
app.post('/send-email', authMiddleware, async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log("Email sent:", info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// =======================
// Discussion Room Routes
// =======================

// Get all rooms that the current user is a member of
app.get('/api/rooms', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.username as created_by_name 
       FROM discussion_rooms r 
       JOIN users u ON r.created_by = u.id
       WHERE r.id IN (
         SELECT room_id FROM room_participants WHERE user_id = $1
       )
       ORDER BY r.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new room
// Create a new room
app.post('/api/rooms', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create the room
      const roomResult = await client.query(
        "INSERT INTO discussion_rooms (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
        [name, description, req.userId]
      );
      const room = roomResult.rows[0];

      // Add the creator as the first participant
      await client.query(
        "INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)",
        [room.id, req.userId]
      );

      await client.query('COMMIT');

      // Get the room with creator info
      const finalRoomResult = await pool.query(
        `SELECT r.*, u.username as created_by_name 
         FROM discussion_rooms r 
         JOIN users u ON r.created_by = u.id
         WHERE r.id = $1`,
        [room.id]
      );

      res.json(finalRoomResult.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a user to a room (admin only)
// Add a user to a room (admin only)
app.post('/api/rooms/:roomId/add-user', authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const { email } = req.body;

  try {
    // Check if the current user is the room admin
    const roomCheck = await pool.query(
      "SELECT created_by FROM discussion_rooms WHERE id = $1",
      [roomId]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (Number(roomCheck.rows[0].created_by) !== Number(req.userId)) {
      return res.status(403).json({ error: "Only room admin can add users" });
    }

    // Find the user by email
    const userResult = await pool.query(
      "SELECT id, username FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;
    const username = userResult.rows[0].username;

    // Check if user is already in the room
    const existingParticipant = await pool.query(
      "SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2",
      [roomId, userId]
    );

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ error: "User is already in this room" });
    }

    // Add user to the room
    await pool.query(
      "INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)",
      [roomId, userId]
    );

    res.json({
      message: "User added to room successfully",
      user: { id: userId, username, email }
    });
  } catch (err) {
    console.error("Error adding user to room:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get room details with participants
// Get room details with participants
app.get('/api/rooms/:roomId', authMiddleware, async (req, res) => {
  const { roomId } = req.params;

  try {
    // Check if user is a participant
    const participantCheck = await pool.query(
      "SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2",
      [roomId, req.userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    // Get room details
    const roomResult = await pool.query(
      `SELECT r.*, u.username as created_by_name 
       FROM discussion_rooms r 
       JOIN users u ON r.created_by = u.id
       WHERE r.id = $1`,
      [roomId]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const room = roomResult.rows[0];

    // Get participants with their usernames
    const participantsResult = await pool.query(
      `SELECT u.id, u.username, u.email 
       FROM room_participants rp 
       JOIN users u ON rp.user_id = u.id 
       WHERE rp.room_id = $1`,
      [roomId]
    );

    room.users = participantsResult.rows;

    res.json(room);
  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this route to your server.js
app.get('/api/current-user', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [req.userId]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get room messages
app.get('/api/rooms/:roomId/messages', authMiddleware, async (req, res) => {
  const { roomId } = req.params;

  try {
    // Check if user is a participant
    const participantCheck = await pool.query(
      "SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2",
      [roomId, req.userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    // Get messages
    const messagesResult = await pool.query(
      `SELECT m.*, u.username as sender_name 
       FROM room_messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.room_id = $1
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    res.json(messagesResult.rows);
  } catch (err) {
    console.error("Error fetching room messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Notification routes
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [req.userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error("Error updating notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Notification preferences
app.get('/api/notification-preferences', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_notification_preferences WHERE user_id = $1',
      [req.userId]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error("Error fetching preferences:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put('/api/notification-preferences', authMiddleware, async (req, res) => {
  try {
    const { email_notifications, push_notifications, desktop_notifications, sound_enabled } = req.body;

    const result = await pool.query(`
      INSERT INTO user_notification_preferences 
        (user_id, email_notifications, push_notifications, desktop_notifications, sound_enabled)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        email_notifications = $2,
        push_notifications = $3,
        desktop_notifications = $4,
        sound_enabled = $5
      RETURNING *
    `, [req.userId, email_notifications, push_notifications, desktop_notifications, sound_enabled]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Notification service functions
// Modify your notification creation function
const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, related_id, related_type) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, type, title, message, relatedId, relatedType]
    );

    const notification = result.rows[0];

    // Emit real-time notification
    if (onlineUsers[userId]) {
      io.to(onlineUsers[userId]).emit('newNotification', notification);
      io.to(onlineUsers[userId]).emit('notificationCountUpdate', {
        count: await getUnreadCount(userId)
      });
    }

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

// Helper function to get unread count
const getUnreadCount = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
  return parseInt(result.rows[0].count);
};
// Check for mentions in messages
const checkForMentions = async (message, roomId, senderId) => {
  const mentionRegex = /@(\w+)/g;
  let match;
  const mentions = [];

  while ((match = mentionRegex.exec(message)) !== null) {
    mentions.push(match[1]);
  }

  for (const username of mentions) {
    try {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (userResult.rows.length > 0) {
        const mentionedUserId = userResult.rows[0].id;
        await createNotification(
          mentionedUserId,
          'mention',
          'You were mentioned',
          `You were mentioned in a message in room ${roomId}`,
          roomId,
          'room'
        );
      }
    } catch (err) {
      console.error("Error processing mention:", err);
    }
  }
};



// Socket.IO setup
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store userId -> socket.id mapping
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle authentication when socket connects
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, SECRET);
      const userId = decoded.id;
      onlineUsers[userId] = socket.id;
      socket.userId = userId;
      console.log(`User ${userId} authenticated on socket ${socket.id}`);

      // Emit success event back to client
      socket.emit("authenticated", { userId });
    } catch (err) {
      console.log("Invalid token on socket:", err.message);
      socket.emit("unauthorized", { error: "Invalid token" });
    }
  });
  socket.on("leaveAllRooms", () => {
    const rooms = Array.from(socket.rooms).filter(r => r.startsWith("room_"));
    rooms.forEach(r => socket.leave(r));
    console.log(`User ${socket.userId} left all rooms`);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ receiverId, message }) => {
    try {
      // Save in DB
      const result = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *",
        [socket.userId, receiverId, message]
      );
      const savedMessage = result.rows[0];

      // Send to receiver if online
      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit("receiveMessage", savedMessage);
      }

      // Also emit back to sender (for chat UI update)
      io.to(socket.id).emit("receiveMessage", savedMessage);

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle joining a discussion room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(`room_${roomId}`);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  // Handle sending room message
  // Handle sending room message
  socket.on("sendRoomMessage", async ({ roomId, message }) => {
    console.log("💬 sendRoomMessage received:", { roomId, userId: socket.userId, message });

    if (!socket.userId) {
      console.error("❌ No socket.userId, message not saved");
      return;
    }

    try {
      const result = await pool.query(
        "INSERT INTO room_messages (room_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *",
        [roomId, socket.userId, message]
      );
      const savedMessage = result.rows[0];

      // Fetch sender name
      const userResult = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [socket.userId]
      );
      if (userResult.rows.length > 0) {
        savedMessage.sender_name = userResult.rows[0].username;
      }

      // Check for mentions
      await checkForMentions(message, roomId, socket.userId);

      // Send notification to all room participants except sender
      const participants = await pool.query(
        'SELECT user_id FROM room_participants WHERE room_id = $1 AND user_id != $2',
        [roomId, socket.userId]
      );

      for (const participant of participants.rows) {
        await createNotification(
          participant.user_id,
          'message',
          'New message',
          `New message in room ${roomId}`,
          roomId,
          'room'
        );
      }

      io.to(`room_${roomId}`).emit("receiveRoomMessage", savedMessage);
    } catch (err) {
      console.error("Error saving room message:", err);
    }
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.userId) {
      delete onlineUsers[socket.userId];
    }
  });
});

const PORT = process.env.PORT || 5000;

// Use the HTTP server (which includes Socket.io) instead of Express app directly
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔌 Socket.io server is ready`);
});
