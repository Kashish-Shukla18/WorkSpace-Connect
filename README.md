# WorkSpace Connect

A full-stack team workspace portal for project management, employee directory, real-time chat, discussion rooms, notifications, and birthday celebrations. Built as a monorepo with a React frontend and Node.js/Express API backed by PostgreSQL.

**Live demo (API):** `https://workspace-connect.onrender.com`

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Live metrics (projects, tasks, employees, notifications), recent activity, and upcoming deadlines |
| **Projects** | Create and browse projects |
| **Tasks** | Create tasks, assign users, update status, track due dates |
| **Employees** | HR directory with departments, roles, profiles, and image upload |
| **Calendar** | Workspace calendar view |
| **Birthdays** | Today’s birthdays and upcoming celebrations with email wishes |
| **Direct Chat** | 1:1 messaging between users (Socket.IO) |
| **Discussion Rooms** | Channel-based team chat with members and @mentions |
| **Notifications** | In-app alerts with read/unread state and preferences |
| **Profile & Settings** | Update account details, password, and notification preferences |

---

## Tech Stack

### Frontend (`frontend/`)
- React 19 + React Router 7
- Axios for REST API calls
- Socket.IO client for real-time messaging
- Custom CSS with design tokens (dark theme, cyan accent)

### Backend (`backend/`)
- Node.js + Express 5
- PostgreSQL (`pg`)
- JWT authentication
- Socket.IO for chat and live notifications
- bcryptjs for password hashing
- Nodemailer (email / birthday wishes)

---

## Project Structure

```
WorkSpace-Connect/
├── backend/
│   ├── server.js          # Express app, REST routes, Socket.IO
│   ├── schema.sql         # PostgreSQL schema + seed data
│   ├── utils/
│   │   └── mailer.js      # Email helper utilities
│   ├── package.json
│   └── .env               # Environment variables (not committed)
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.js             # Route definitions
    │   ├── config.js          # API base URL
    │   ├── ProtectedLayout.js # Auth guard + Socket.IO bootstrap
    │   ├── Layout.js          # Header + sidebar shell
    │   ├── Dashboard.js
    │   ├── ProjectsList.js / AddProject.js
    │   ├── TasksPage.js / CreateTask.js
    │   ├── EmployeesPage.js / CreateEmployee.js / EditEmployee.js / EmployeeDetails.js
    │   ├── ChatPage.js / DiscussionRoomPage.js
    │   ├── Birthday.js
    │   ├── Profile.js / Settings.js
    │   └── *.css              # Component stylesheets
    └── package.json
```

---

## Prerequisites

- **Node.js** 18+ (recommended)
- **npm** 9+
- **PostgreSQL** 14+

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd WorkSpace-Connect
```

### 2. Set up the database

Create a PostgreSQL database, then run the schema:

```bash
psql -U postgres -d project_management -f backend/schema.sql
```

Or using your preferred SQL client, execute `backend/schema.sql` against your database.

### 3. Configure the backend

Create `backend/.env`:

```env
# Database (use DATABASE_URL OR individual fields)
DATABASE_URL=
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_management

# Server
PORT=5000

# Email (optional — required for birthday wishes & task emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Session (if using express-session)
SESSION_SECRET=your-random-secret
```

Install dependencies and start the API:

```bash
cd backend
npm install
npm start
```

The server runs at **http://localhost:5000**.

### 4. Configure the frontend

Point the frontend at your API. Edit `frontend/src/config.js`:

```js
export const API_BASE_URL = "http://localhost:5000";
```

For production, use your deployed backend URL (e.g. Render).

Install and run:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**.

### 5. Create an account

1. Open `http://localhost:3000/register`
2. Sign up with username, email, and password
3. Log in and explore the dashboard

---

## Application Workflow

```
Login / Register
       │
       ▼
   Dashboard ──────┬──────────────┬─────────────┐
       │            │              │             │
       ▼            ▼              ▼             ▼
   Projects      Tasks        Employees     Discussion
       │            │              │             │
       ▼            ▼              ▼             ▼
  Add Project   Create Task   View / Edit    Channel Chat
                              Employee
       │
       ├─► Calendar
       ├─► Birthdays (send wishes)
       ├─► Direct Chat (1:1)
       ├─► Profile (account & linked employee)
       └─► Settings (notifications)
```

---

## Frontend Routes

| Route | Page | Auth |
|-------|------|------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard overview | Protected |
| `/projects` | Project list | Protected |
| `/add-project` | Create project | Protected |
| `/tasks` | Task board | Protected |
| `/create-task` | Create task | Protected |
| `/employees` | Employee directory | Protected |
| `/employees/create` | Add employee | Protected |
| `/employees/:id` | Employee details | Protected |
| `/employees/edit/:id` | Edit employee | Protected |
| `/calendar` | Calendar | Protected |
| `/birthday` | Birthday wishes | Protected |
| `/chat` | Direct messages | Protected |
| `/discussion` | Discussion rooms | Protected |
| `/profile` | User profile | Protected |
| `/settings` | Notification settings | Protected |

Protected routes use JWT stored in `localStorage` as `token`. The `Authorization` header is sent as the raw token (no `Bearer` prefix).

---

## API Overview

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Create user |
| `POST` | `/login` | Returns JWT token |
| `GET` | `/api/current-user` | Current user info |

### Dashboard & Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Metrics, activity, deadlines |
| `GET` | `/api/profile` | Profile + linked employee |
| `PUT` | `/api/profile` | Update username/email |
| `PUT` | `/api/profile/password` | Change password |
| `GET` | `/api/settings` | User settings |
| `PUT` | `/api/settings` | Save notification preferences |

### Projects & Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Create project |
| `GET` | `/api/tasks/assigned` | Tasks for current user |
| `POST` | `/tasks` | Create task |
| `PATCH` | `/api/tasks/:id/status` | Update task status |

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employees` | Paginated list (filters: `page`, `limit`, `department`, `status`, `search`) |
| `POST` | `/api/employees` | Create employee |
| `GET` | `/api/employees/:id` | Employee details |
| `PUT` | `/api/employees/:id` | Update employee |
| `DELETE` | `/api/employees/:id` | Delete employee |
| `GET` | `/api/departments` | Department list |
| `GET` | `/api/roles` | Role list |
| `GET` | `/api/birthdays` | Today + upcoming birthdays |

### Chat & Discussions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | All users (for chat) |
| `GET` | `/messages/:userId` | DM history |
| `GET` | `/api/rooms` | User’s discussion rooms |
| `POST` | `/api/rooms` | Create room |
| `GET` | `/api/rooms/:roomId` | Room details + members |
| `GET` | `/api/rooms/:roomId/messages` | Room message history |
| `POST` | `/api/rooms/:roomId/add-user` | Add member (room owner) |

### Notifications & Email

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Recent notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark one read |
| `PATCH` | `/api/notifications/read-all` | Mark all read |
| `POST` | `/send-email` | Send email (e.g. birthday wish) |

### Socket.IO Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `authenticate` | Client → Server | Authenticate with JWT |
| `sendMessage` / `receiveMessage` | Both | Direct messages |
| `joinRoom` / `leaveAllRooms` | Client → Server | Room membership |
| `sendRoomMessage` / `receiveRoomMessage` | Both | Channel messages |
| `newNotification` | Server → Client | Live notification push |

---

## Database Schema

Tables defined in `backend/schema.sql`:

- `users` — authentication accounts
- `projects` — project records
- `tasks` — task assignments and status
- `departments` / `roles` — employee org structure
- `employees` — HR profiles
- `messages` — direct messages
- `discussion_rooms` / `room_participants` / `room_messages` — team channels
- `notifications` — user alerts
- `user_notification_preferences` — per-user notification settings

---

## Scripts

### Backend

```bash
npm start          # Run server (node server.js)
```

### Frontend

```bash
npm start          # Development server (port 3000)
npm run build      # Production build
npm test           # Run tests
```

---

## Deployment

### Backend (Render / similar)

1. Set environment variables (`DATABASE_URL`, `PORT`, `EMAIL_USER`, `EMAIL_PASS`)
2. Deploy `backend/` with start command: `node server.js`
3. Ensure PostgreSQL is provisioned and `schema.sql` has been applied

### Frontend

1. Set `API_BASE_URL` in `frontend/src/config.js` to your deployed API
2. Build: `npm run build`
3. Serve the `build/` folder (Netlify, Vercel, static hosting, etc.)

---

## Environment Notes

- **JWT expiry:** Tokens expire after 1 hour; users must log in again when expired.
- **Email:** Birthday wishes and task notification emails require valid `EMAIL_USER` / `EMAIL_PASS` in `.env`. Gmail users typically need an [App Password](https://support.google.com/accounts/answer/185833).
- **CORS:** Enabled for all origins in development; tighten for production if needed.
- **Secrets:** Never commit `.env` files. Rotate database passwords and JWT secrets in production.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Log in again; check token in `localStorage` |
| Dashboard shows no data | Confirm backend is running and `config.js` URL is correct |
| Chat not connecting | Ensure Socket.IO server is up and token is valid |
| Birthday emails fail | Configure `EMAIL_USER` and `EMAIL_PASS` in backend `.env` |
| Employee dropdowns empty | Run `schema.sql` to seed departments and roles |

---

## License

ISC (backend package). See individual `package.json` files for details.
