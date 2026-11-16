# LectureFlow Pro — Lecture Hall Assignment & Break Management System

A full-stack, responsive web application engineered to solve **conflicting class allocations** and guarantee **sufficient breaks (including mandatory lunch breaks)** between lectures in educational institutions.

Built with **React (JavaScript, JSX)**, **Tailwind CSS**, and **Node.js (ES6 Modules)** with **PostgreSQL** database support and a resilient zero-config fallback.

---

## 🎯 Core Objectives & Solutions

Educational timetabling frequently encounters severe friction:
1. **Conflicting Class Allocation Issues**:
   - **Hall Double-Booking / Collisions**: Multiple courses allocated to the same lecture room at overlapping times.
   - **Faculty Double-Booking**: An instructor scheduled to teach multiple courses simultaneously.
   - **Capacity Deficits**: High-enrollment classes booked into undersized lecture rooms.
2. **Insufficient Break & Lunch Break Issues**:
   - **Lunch Hour Intrusion**: Lectures scheduled across the critical lunch window (e.g., 12:00 PM – 1:00 PM), causing student and faculty burnout.
   - **Zero Passing Buffer / Travel Fatigue**: Consecutive lectures back-to-back with 0–5 minutes gap, making cross-campus travel between buildings impossible.
   - **Faculty Cognitive Overload**: Instructors scheduled for >3 hours of continuous lecturing without cognitive rest.

### How LectureFlow Pro Solves This:
- 🍽️ **Institutional Break & Lunch Policy Engine**: Configure a protected lunch window (e.g. 12:00 PM – 1:00 PM) and minimum passing period (10–15 mins).
- 🧠 **Constraint-Aware Auto Scheduler**: Automatically prioritizes room capacity, eliminates clashes, avoids the lunch hour, and enforces travel buffers.
- ⚠️ **Real-Time Conflict Detector**: Flags hall collisions, faculty clashes, room shortages, and **insufficient break / lunch infringements**.
- ⚡ **1-Click Auto-Resolver & Interactive Solutions**: Automatically shifts clashing lectures to safe afternoon/morning slots, larger rooms, or injects travel buffers.

---

## 🏗️ Architecture & Modular Structure

```
lecture-hall-main/
├── client/                              # React Frontend (JavaScript, JSX)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/Login.jsx           # Portal login with 1-click demo roles
│   │   │   ├── common/                  # Navbar, Sidebar, Modal, Badges
│   │   │   ├── dashboard/Dashboard.jsx  # KPI metrics, break compliance, utilization
│   │   │   ├── departments/             # Academic department CRUD
│   │   │   ├── courses/                 # Course curriculum CRUD & enrollment
│   │   │   ├── halls/                   # Lecture halls, facilities & status
│   │   │   ├── timeslots/               # Time slots with lunch detection
│   │   │   ├── policies/PolicyManagement.jsx # Break & lunch policy panel
│   │   │   ├── scheduler/ScheduleGenerator.jsx # Constraint solver
│   │   │   ├── conflicts/ConflictReport.jsx    # Detection & 1-click resolution
│   │   │   ├── timetable/Timetable.jsx  # Responsive grid with lunch bands
│   │   │   └── export/ExportPage.jsx    # CSV export & print dialog
│   │   ├── context/AppContext.jsx       # Reactive global state & caching
│   │   ├── services/api.js              # Centralized REST API client
│   │   ├── App.jsx                      # App routes & toast notifications
│   │   ├── index.css                    # Tailwind CSS directives & print styles
│   │   └── main.jsx
│   ├── tailwind.config.js               # Tailwind custom theme colors
│   ├── vite.config.js                   # Vite dev server with proxy to :5003
│   └── package.json
│
├── server/                              # Node.js Backend (ES6 Modules)
│   ├── src/
│   │   ├── config/db.js                 # PostgreSQL Pool + in-memory store
│   │   ├── controllers/                 # REST controllers
│   │   ├── services/
│   │   │   ├── conflictService.js       # Multi-category conflict & break detector
│   │   │   ├── schedulerService.js      # Capacity & lunch-safe solver algorithm
│   │   │   └── resolutionService.js     # Single & bulk auto-resolve logic
│   │   ├── routes/                      # Modular Express router endpoints
│   │   ├── data/seedData.js             # Initial university dataset
│   │   └── server.js                    # Express application entry
│   ├── schema.sql                       # Full PostgreSQL schema definition
│   ├── .env.example                     # Environment template
│   └── package.json
│
├── README.md
└── package.json                         # Unified root scripts
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; v24 supported)
- **npm** (v9 or higher)

### 2. Installation
Install all dependencies for root, server, and client with one command:
```bash
npm run install:all
```
*(Or install in respective folders: `cd server && npm install` then `cd client && npm install`)*

### 3. Run the Full Application (Concurrent Development)
From the root directory:
```bash
npm run dev
```
This concurrently starts:
- 🚀 **Backend API**: `http://localhost:5003/api`
- 💻 **Frontend Web App**: `http://localhost:3000`

*(Alternatively, you can run them in separate terminals)*:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

---

## 🐘 PostgreSQL Configuration

The application is engineered to work **out-of-the-box immediately** using an in-memory database store, and seamlessly connects to **PostgreSQL** whenever you provide your database URL.

### To Connect PostgreSQL:
1. Open `server/.env` (or copy from `server/.env.example`).
2. Add your PostgreSQL connection URL:
   ```env
   PORT=5003
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/lecture_hall_db
   ```
   *(Works with local PostgreSQL, Docker, Supabase, Neon, Railway, or AWS RDS)*
3. When the server starts:
   - It will automatically connect to PostgreSQL.
   - It executes `CREATE TABLE IF NOT EXISTS` for all tables.
   - If tables are empty, it automatically seeds initial sample data.
   - The UI top bar will display: **`PostgreSQL Active`** in green!

*(You can also inspect or run the complete table schema manually in `server/schema.sql`)*.

---

## 🔐 Demo Credentials

The login portal features convenient **1-Click Demo Buttons** or manual credentials:

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Full administrative control, policy config & scheduling |
| **Academic Staff** | `staff` | `staff123` | Coordinator access, viewing & department exports |

---

## 📋 Comprehensive Feature Guide

### 1. ☕ Institutional Break & Lunch Policy Engine (`/policies`)
- Configure mandatory **Lunch Break Start & End** (Default: `12:00` - `13:00`).
- Toggle **Enforce Lunch Break Constraint** on the timetable.
- Set **Minimum Passing Period** (e.g. 15 minutes between back-to-back classes).
- Set **Cross-Building Travel Buffer** (e.g. 20 minutes when moving between buildings).
- Set **Maximum Continuous Teaching Hours** (e.g. 3 hours before fatigue alert).

### 2. 🎯 Intelligent Automated Scheduler (`/schedule-generator`)
- Multi-constraint solver that iterates through courses ordered by enrollment size.
- Strictly adheres to room capacities, faculty availability, and lunch breaks.
- Returns utilization score, break compliance rate (%), and generates a clash-free schedule.
- Includes a 1-click **Clear Schedule** option.

### 3. ⚠️ Conflict Detector & 1-Click Auto-Resolver (`/conflicts`)
Identifies and categorizes:
- **Lunch Break Violations**: Class overlapping the institutional lunch hour.
- **Insufficient Transition Breaks**: Consecutive classes with `< 15 min` passing buffer.
- **Room Collisions**: Multiple classes in the same room simultaneously.
- **Faculty Double-Booking**: Same instructor assigned to multiple simultaneous classes.
- **Capacity Overflow**: Class size exceeding room capacity.

Features **1-Click Auto-Resolve All** and individual action buttons:
- Move to recommended larger hall.
- Shift class out of lunch hours to an afternoon/morning slot.
- Inject required travel buffer.
- Split oversized classes into sections.

### 4. 📅 Master Interactive Timetable (`/timetable`)
- Filterable by: **Lecture Hall**, **Department**, **Instructor**, and **Day of Week**.
- Distinct **LUNCH BREAK WINDOW** visual band spanning across all days.
- Conflict warnings and capacity alerts directly on affected schedule cards.
- **Fully editable**: click any lecture to reassign its course, hall, day or time, or remove it; click an empty slot to add a new lecture.
- Live summary of scheduled lectures, halls in use, conflicts and utilization, plus an unscheduled-courses notice.
- Print-ready with browser print styling (`Ctrl + P` / `Cmd + P`).

### 5. 📄 Export & Print (`/export`)
- **Master Timetable CSV**: Complete data sheet with course, hall, day, time, and enrollments.
- **Conflicts Audit CSV**: Detailed report of all detected clashes and violation minutes.
- **Direct Browser Print**: Formatted layout for A4 landscape document printing.

---

## 🛠️ API Reference Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health & Postgres connection status |
| `POST` | `/api/auth/login` | Authenticate user & retrieve session |
| `GET` | `/api/departments` | List all departments with course counts |
| `POST` | `/api/departments` | Create academic department |
| `GET` | `/api/courses` | List all courses with scheduling status |
| `POST` | `/api/courses` | Register course |
| `GET` | `/api/lecture-halls` | List halls with capacity & utilization |
| `POST` | `/api/lecture-halls` | Add lecture hall |
| `PATCH` | `/api/lecture-halls/:id/toggle-status` | Toggle hall availability |
| `GET` | `/api/time-slots` | List time slots with lunch detection |
| `GET` | `/api/schedules` | List all scheduled lectures |
| `POST` | `/api/schedules/generate` | Run break-compliant auto scheduler |
| `DELETE` | `/api/schedules/clear` | Clear all schedules |
| `GET` | `/api/conflicts` | Audit timetable for conflicts & break issues |
| `POST` | `/api/conflicts/resolve` | Apply specific suggested solution |
| `POST` | `/api/conflicts/auto-resolve` | Auto-resolve all timetable conflicts |
| `GET` | `/api/conflicts/export-csv` | Download conflicts audit CSV |
| `GET` | `/api/policies` | Retrieve active break & lunch policies |
| `PUT` | `/api/policies` | Update break & lunch policies |
| `GET` | `/api/dashboard/summary` | Retrieve KPI metrics & compliance rate |

---

## 📄 License
MIT License. Built for modern academic institutions.
