<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-6c5ce7?style=for-the-badge" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Socket.io-Real--Time-00d68f?style=for-the-badge&logo=socket.io" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Redux-Toolkit-764abc?style=for-the-badge&logo=redux" alt="Redux" />
  <img src="https://img.shields.io/badge/JWT-Auth-ff5252?style=for-the-badge" alt="JWT" />
</p>

# ⚡ Real-Time Productivity Management System

> A high-performance, real-time task management platform with smart dynamic prioritization, WebSocket-powered live updates, and an intelligent productivity insights dashboard — built on the MERN stack.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Smart Prioritization Algorithm](#-smart-prioritization-algorithm)
- [Real-Time Sync](#-real-time-sync)

---

## 🎯 Overview

The **Real-Time Productivity Management System** is a full-stack web application designed to solve the core challenge of modern task management: **keeping teams synchronized in real time while intelligently surfacing what matters most.**

Unlike traditional task trackers, this system:
- **Dynamically calculates task priority** using a mathematical formula based on deadline proximity
- **Syncs all changes in under 1 second** via WebSocket events — zero page refreshes
- **Provides live productivity insights** that update as tasks change
- **Persists all data** in MongoDB Atlas — no local-only storage

---

## ✨ Key Features

### 🔐 Module 1 — Authentication & Core Persistence
- JWT-based **Register** and **Login** APIs
- Password hashing with **bcryptjs** (12 salt rounds)
- Protected routes with token-based middleware
- All data persisted in **MongoDB Atlas** cluster

### 🧠 Module 2 — Smart Dynamic Prioritization
- Priority is **never stored statically** — computed on every request
- Algorithm: `PriorityScore = 1 / (Deadline - CurrentTime)`
- Overdue detection: Tasks past deadline auto-flagged as **Overdue (Highest Priority)**
- Labels: `Overdue` → `Critical` → `High` → `Medium` → `Low`
- Response pre-sorted by priority score (descending)

### ⚡ Module 3 — Real-Time Sync (The 1-Second Rule)
- **Socket.io** server with JWT-authenticated connections
- User-specific rooms for targeted event broadcasting
- Events emitted on every DB mutation: `task:created`, `task:updated`, `task:deleted`
- Frontend Redux state updates **instantly** via socket listeners
- **Zero page refresh** — all UI changes are live

### 📊 Module 4 — Insights & Responsive UI
- Live dashboard cards: Total, Completed, Pending task counts
- **Most Active Category** computed from current task distribution
- Filter tabs: All · Pending · In Progress · Completed · Overdue
- Fully responsive design (desktop + tablet + mobile)
- Redux Toolkit for all global state management

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Redux Toolkit, Axios, Socket.io Client |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **State Management** | Redux Toolkit (createSlice, createAsyncThunk) |
| **Real-Time** | Socket.io (WebSocket + polling fallback) |
| **Styling** | Vanilla CSS (custom design system, responsive) |

---

## 🏗 Architecture

```
├── server/                     # Backend (Node.js + Express)
│   ├── app.js                  # Entry: Express + Socket.io + Mongoose
│   ├── models/
│   │   ├── user.js             # User schema (username, email, password)
│   │   └── task.js             # Task schema (title, desc, category, status, deadline, user)
│   ├── routes/
│   │   ├── auth.js             # JWT authentication middleware
│   │   ├── user.js             # POST /api/auth/register, POST /api/auth/login
│   │   └── task.js             # CRUD /api/tasks + priority algorithm + socket emitters
│   └── .env                    # Environment variables
│
├── client/                     # Frontend (React + Redux)
│   └── src/
│       ├── store/
│       │   ├── index.js        # Redux store configuration
│       │   └── slices/
│       │       ├── authSlice.js   # Auth state (register, login, logout)
│       │       └── taskSlice.js   # Task state (CRUD + socket event handlers)
│       ├── services/
│       │   ├── api.js          # Axios instance with JWT interceptor
│       │   └── socket.js       # Socket.io client with Redux dispatch
│       └── components/
│           ├── App.js          # Routes (protected + public)
│           ├── Login.jsx       # Login page
│           ├── Register.jsx    # Registration page
│           ├── Dashboard.jsx   # Main dashboard (insights + task grid)
│           ├── TaskCard.jsx    # Individual task card component
│           └── TaskModal.jsx   # Create/edit task modal
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ and **npm**
- **MongoDB Atlas** account (or connection URI)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ayushmaanagarwal1211/project-manager.git
cd project-manager

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Running the Application

```bash
# Terminal 1 — Start the backend server
cd server
npm start
# ✅ Server running on port 8800
# ✅ MongoDB Atlas connected

# Terminal 2 — Start the frontend
cd client
npm start
# ✅ App running on http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=8800
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
JWT_SECRET=<your-256-bit-secret>
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port number (default: 8800) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT token | ❌ |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks` | Get all tasks (with dynamic priority) | ✅ Bearer |
| `POST` | `/api/tasks` | Create a new task | ✅ Bearer |
| `PUT` | `/api/tasks/:id` | Update a task | ✅ Bearer |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ Bearer |

### Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `task:created` | Server → Client | Full task object with priority |
| `task:updated` | Server → Client | Updated task object with priority |
| `task:deleted` | Server → Client | `{ _id: string }` |

---

## 🧮 Smart Prioritization Algorithm

Priority is **never stored as a static field** — it's calculated dynamically on every `GET /api/tasks` request:

```
PriorityScore = 1 / (Deadline - CurrentTime)
```

| Condition | Priority Label | Score |
|-----------|---------------|-------|
| `CurrentTime > Deadline` & status ≠ Completed | **Overdue** | MAX_SAFE_INTEGER |
| `Deadline - Now < 1 day` | **Critical** | Very High |
| `Deadline - Now < 3 days` | **High** | High |
| `Deadline - Now < 7 days` | **Medium** | Medium |
| `Deadline - Now ≥ 7 days` | **Low** | Low |
| `status === "Completed"` | **Completed** | 0 |

Tasks are **pre-sorted by priority score (descending)** before being sent to the frontend.

---

## 🔄 Real-Time Sync

Every database mutation triggers a Socket.io event:

```
Client → HTTP Request → Server → MongoDB Write → Socket.io Emit → All Connected Clients → Redux Dispatch → UI Update
```

- Socket connections are **authenticated via JWT** (handshake auth)
- Each user joins a **private room** (their user ID) for targeted broadcasts
- Frontend socket listeners dispatch Redux actions (`socketTaskCreated`, `socketTaskUpdated`, `socketTaskDeleted`)
- UI reflects changes in **< 1 second** without any page refresh

---

## 📄 License

This project is licensed under the ISC License.