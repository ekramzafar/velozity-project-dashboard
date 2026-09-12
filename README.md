# Velozity Project Dashboard

A full-stack real-time project management dashboard built with React,
TypeScript, Node.js, Express, PostgreSQL, Prisma and Socket.IO.

## Features

- JWT authentication with access and refresh tokens
- HttpOnly refresh-token cookie
- Server-side Role-Based Access Control (RBAC)
- Admin, Project Manager and Developer roles
- Project and task management
- Task assignment and status management
- Activity logging
- Real-time task updates with Socket.IO
- Real-time notifications
- Overdue task scheduler
- Role-aware dashboard statistics
- PostgreSQL database with Prisma ORM
- Seed data for local demonstration

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- Zod
- JWT
- bcryptjs
- node-cron

### Database

- PostgreSQL
- Prisma ORM

---

## Architecture

```text
React Client
     |
     | REST API
     v
Express Server
     |
     +--> Authentication Middleware
     |
     +--> RBAC Middleware
     |
     +--> Controllers
     |
     +--> Services
     |
     +--> Prisma ORM
              |
              v
         PostgreSQL

Real-time communication:

React Client
     |
     | Socket.IO
     v
Socket.IO Server
     |
     +--> User Rooms
     |
     +--> Project Rooms
     |
     +--> Real-time Events
---

## Roles and Permissions

### Admin

- View all projects and tasks
- Create and update projects
- Delete projects
- Assign developers
- View system activity
- View dashboard statistics

### Project Manager

- View owned projects
- Create and update owned projects
- Create and manage tasks in owned projects
- Assign developers
- View project activity
- Receive task review notifications

### Developer

- View assigned tasks
- View related projects
- Update assigned task status
- Receive assignment notifications
- Receive status notifications
- Receive overdue notifications

Authorization is enforced server-side.

Frontend route protection is only used for user experience and is not
considered a security boundary.

---

## Database Design

The application uses PostgreSQL with Prisma.

### Main Entities

- User
- Client
- Project
- Task
- ActivityLog
- Notification
- RefreshToken

### Relationships

```text
Client
   |
   +---- Projects
            |
            +---- Tasks
            |
            +---- ActivityLogs

User
 |
 +---- Projects
 +---- Tasks
 +---- ActivityLogs
 +---- Notifications
 +---- RefreshTokens
            |
            +---- RefreshTokens

---

## Task

A task contains:

- Title
- Description
- Project
- Assigned developer
- Status
- Priority
- Due date
- Created and updated timestamps

### Supported Statuses

```text
TODO
IN_PROGRESS
IN_REVIEW
DONE
OVERDUE

### Supported Priorities

- LOW
- MEDIUM
- HIGH
- CRITICAL

---

## Authentication

Authentication uses JWT access and refresh tokens.

### Login Flow

1. User submits email and password.
2. Server validates the request using Zod.
3. Password is verified using bcrypt.
4. An access token is generated.
5. A refresh token is generated.
6. A hash of the refresh token is stored in PostgreSQL.
7. The refresh token is returned through an HttpOnly cookie.
8. The access token is returned to the frontend.

The access token is used for authenticated API requests.

The refresh token is used to obtain a new access token.

---

## Real-Time Communication

Socket.IO provides real-time communication between authenticated clients
and the backend.

### Important Events

```text
task:created
task:status_updated
task:assigned
task:overdue
notification:new
presence:update

Uske turant neeche:

User-specific notifications are sent through user rooms:

```text
user:<userId>

Project-level task events use:

project:<projectId>

The Socket.IO connection is authenticated using the JWT access token.

Notifications

Notifications are persisted in PostgreSQL and delivered in real time
through Socket.IO.

Examples include:

New task assignment
Task status update
Task becoming overdue
Task moved to In Review

When a developer moves a task to IN_REVIEW, the Project Manager receives
a real-time Task Ready for Review notification.

Users can:

View notifications
Mark individual notifications as read
Mark all notifications as read
Overdue Scheduler

The backend uses node-cron to periodically check for overdue tasks.

A task becomes overdue when:

dueDate < current time
AND
status != DONE

The scheduler then:

Updates the task status to OVERDUE.
Creates an activity log.
Emits a real-time overdue event.
Sends a notification to the assigned developer.

This process runs on the backend and does not depend on frontend polling.

API Overview

Base URL:

http://localhost:5000/api
Authentication
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
Projects
GET    /projects
GET    /projects/:id
POST   /projects
PATCH  /projects/:id
DELETE /projects/:id
Tasks
GET   /tasks
GET   /tasks/:id
POST  /tasks
PATCH /tasks/:id/status
PATCH /tasks/:id/assign
Activity
GET /activity
Notifications
GET   /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
Dashboard
GET /dashboard
Health
GET /health
Validation and Security

The backend performs server-side validation and authorization.

Security measures include:

Zod request validation
JWT authentication
HttpOnly refresh-token cookie
Hashed refresh tokens
bcrypt password verification
Server-side RBAC
Project ownership checks
Developer assignment validation
Protected API routes
Authenticated Socket.IO connections
Configured CORS

A user cannot access another user's protected resources simply by changing
frontend routes or request parameters.

Local Development
Prerequisites
Node.js 20+
npm
PostgreSQL 16+
Backend
cd server
npm install

Create server/.env using server/.env.example.

Then run:

npx prisma migrate dev
npm run prisma:seed
npm run dev

Backend:

http://localhost:5000

Frontend

Open another terminal:

cd client
npm install
npm run dev

Frontend:

http://localhost:5173

Environment Variables

Example:

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/velozity_dashboard?schema=public"
JWT_ACCESS_SECRET="replace-with-a-strong-access-secret"
JWT_REFRESH_SECRET="replace-with-a-strong-refresh-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"

Never commit the real .env file.

Production deployments should use strong environment-specific secrets.

Seed Data

The project includes seed data for demonstration.

Run:

npm run prisma:seed

The seed creates:

Admin users
Project Managers
Developers
Clients
Projects
Tasks
Activities
Notifications

Some tasks have past due dates to demonstrate the overdue scheduler.

Demo Credentials

All seeded users use:

Password123!
Admin

admin@velozity.com

Project Manager

sarah@velozity.com

Developer

alice@velozity.com

Project Structure
velozity-project-dashboard/
│
├── client/
│   └── src/
│       ├── context/
│       ├── lib/
│       ├── pages/
│       ├── App.tsx
│       └── main.tsx
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       ├── socket/
│       ├── jobs/
│       ├── app.ts
│       └── server.ts
│
├── .gitignore
├── README.md
└── prisma7.config.ts
Verification
Backend
cd server
npm run build
Frontend
cd client
npm run build

Before submission verify:

Login works
Refresh token works
Logout works
Server-side RBAC works
Project ownership works
Developer task restrictions work
Task status updates work
Real-time task updates work
Real-time notifications work
Activity logs work
Notifications can be marked as read
Overdue scheduler works
Seed data works
Backend builds successfully
Frontend builds successfully
Known Limitations
Local development uses HTTP.
Development JWT secrets are intended for local use only.
Production should use HTTPS and secure cookies.
Some task filtering is currently performed client-side.
Socket.IO requires a persistent backend runtime in production.
Production deployment requires environment-specific configuration.
Architectural Decisions
TypeScript

TypeScript provides type safety across the frontend and backend and helps
catch errors during development.

Prisma

Prisma provides a strongly typed database client and migration workflow
while using PostgreSQL as the relational database.

Socket.IO

Socket.IO provides reliable real-time communication for task updates,
notifications, and presence.

Server-Side RBAC

Authorization is implemented on the backend because frontend-only access
control can be bypassed by directly calling APIs.

HttpOnly Refresh Token

The refresh token is stored in an HttpOnly cookie so client-side JavaScript
cannot directly access it.

Future Improvements

Potential improvements include:

Server-side task filtering
Due-date range filtering
Pagination
Automated RBAC tests
API integration tests
Refresh-token rotation
Rate limiting
Centralized structured error middleware
Redis Socket.IO adapter for horizontal scaling
Production monitoring
Automated deployment
Submission

This project demonstrates a complete full-stack workflow using:

React
TypeScript
Node.js
Express
PostgreSQL
Prisma
JWT
Server-side RBAC
Socket.IO
Real-time notifications
Activity logging
Background processing
Seed data

The application is designed around server-side authorization, modular
business logic, relational data integrity, and real-time user experience.
