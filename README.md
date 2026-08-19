# ⚡ PulseStream • Real-Time Data Analytics Dashboard

A modern, production-grade real-time admin analytics dashboard and telemetry ingestion engine built with **React (Vite)**, **Node.js/Express**, **MongoDB (Mongoose)**, **Socket.io**, and **Chart.js**.

---

## 🌐 Live Deployments & Demo

| Service | Platform | Live URL |
| :--- | :--- | :--- |
| 💻 **Frontend Web App** | **Vercel** | **[https://real-time-data-analytics-dashboard1.vercel.app/](https://real-time-data-analytics-dashboard1.vercel.app/)** |
| 📡 **Backend REST API** | **Render** | **[https://real-time-data-analytics-dashboard.onrender.com/api](https://real-time-data-analytics-dashboard.onrender.com/api)** |
| ⚡ **WebSocket Server** | **Render** | **`wss://real-time-data-analytics-dashboard.onrender.com`** |
| 🩺 **API Health Check** | **Render** | **[https://real-time-data-analytics-dashboard.onrender.com/api/health](https://real-time-data-analytics-dashboard.onrender.com/api/health)** |

### 🔑 Demo Accounts (Pre-configured):
- 👑 **Admin**: `admin@example.com` / `Admin@123` *(Full access)*
- 📊 **Analyst**: `analyst@example.com` / `Analyst@123` *(Analytics & CSV export)*
- 👀 **Viewer**: `viewer@example.com` / `Viewer@123` *(Read-only)*

---


## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - 👑 **Admin**: Full access to dashboard, live streams, analytics, and telemetry CRUD operations.
   - 📊 **Analyst**: Access to dashboard, deep-dive time-series trends, categorization analytics, and CSV data export.
   - 👀 **Viewer**: Read-only telemetry metrics and live stream visibility.
   - Protected routes and backend JWT authorization middleware with custom `403 Unauthorized` page.

2. **Real-Time Data Streaming with Socket.io**:
   - Continuous background telemetry generator simulating realistic multi-device fleet packets every 3 seconds.
   - Instant KPI counter increments, dynamic Chart.js re-renders, and newly received row flashing without page refreshes.
   - Connection status monitor: 🟢 **Live**, 🟡 **Reconnecting**, 🔴 **Disconnected** with real-time ping latency.

3. **High-Performance MongoDB Aggregations & Models**:
   - Compound indexes: `{ timestamp: -1 }`, `{ deviceId: 1, timestamp: -1 }`, `{ status: 1 }`, `{ category: 1 }`.
   - Aggregation pipelines for aggregate summary metrics, time-series intervals (`1h`, `6h`, `24h`, `7d`), category distributions, and device fleet workloads.

4. **Rich Chart.js Visualizations**:
   - **Line Chart**: Dual-axis time-series trends tracking telemetry load (%) and temperature (°C) with time window selector (`1h`, `6h`, `24h`, `7d`).
   - **Bar Chart**: Infrastructure category breakdown (Server, IoT-Sensor, Network-Switch, Database, Industrial-PLC).
   - **Doughnut Chart**: Fleet health and operational status distribution (Active, Idle, Warning, Offline) with center statistics.
   - **Fleet Metrics Chart**: Comparative workload and temperature metrics per device.

5. **Server-Side Paginated & Filterable Data Table**:
   - Debounced search across device IDs, names, locations, and alert messages.
   - Filters for Category, Status, Device, and Alert-only flags.
   - Sortable columns, custom row limits (10, 20, 50, 100), and one-click CSV export.

6. **Modern SaaS User Interface**:
   - Responsive sidebar and header navigation with mobile drawer.
   - Dark/Light mode theme switcher.
   - Real-time alert notifications drawer and toast popups for thermal/throughput anomalies.
   - Quick one-click demo credentials on the login screen.

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas URI). If local MongoDB is not running, the server automatically starts an in-memory database fallback for effortless testing.

### 1. Install Dependencies
Run the following from the project root directory:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install individually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration
Inspect or adjust `.env` (already prepared in `server/.env`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/realtime_analytics
JWT_SECRET=super_secret_jwt_key_realtime_analytics_2026_secure!
CLIENT_URL=http://localhost:5173
TELEMETRY_INTERVAL_MS=3000
```

### 3. Seed Demo Data
Populate MongoDB with 750+ historical records and demo users:

```bash
npm run seed
```

### 4. Start the Application
Start both the Express/Socket.io backend and Vite frontend concurrently:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@example.com` | `Admin@123` | Full Read, Write, Update, Delete & Settings |
| 📊 **Analyst** | `analyst@example.com` | `Analyst@123` | View Dashboard, Trends, Deep Analytics & CSV Export |
| 👀 **Viewer** | `viewer@example.com` | `Viewer@123` | Read-only Dashboard & Real-time Live Feed |

*(Use the 1-click login buttons on the login page for rapid testing!)*

---

## 📡 REST API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Create user account (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` - Authenticate user & retrieve JWT token.
- `GET /api/auth/me` - Get profile of currently authenticated user (`Authorization: Bearer <token>`).
- `PUT /api/auth/profile` - Update user profile display name / avatar.

### Telemetry Endpoints
- `GET /api/telemetry` - Paginated and filtered telemetry records.
  - Query parameters: `page`, `limit`, `search`, `category`, `status`, `deviceId`, `hasAlert`, `startDate`, `endDate`, `sortBy`, `order`.
- `GET /api/telemetry/:id` - Fetch single telemetry record.
- `GET /api/telemetry/devices` - Fetch all fleet devices with latest status.
- `POST /api/telemetry` - *(Admin only)* Create manual telemetry entry.
- `PUT /api/telemetry/:id` - *(Admin only)* Update telemetry entry.
- `DELETE /api/telemetry/:id` - *(Admin only)* Delete telemetry entry.

### Analytics Endpoints
- `GET /api/analytics/summary` - Aggregate summary KPI statistics (total records, average values, temperature, status counts, throughput).
- `GET /api/analytics/trends` - Time-series trend aggregation for Line charts (`?range=1h|6h|24h|7d|30d`).
- `GET /api/analytics/categories` - Categorical distribution aggregation.
- `GET /api/analytics/devices` - Device fleet workload comparisons.

---

## ⚡ Socket.io WebSocket Events

| Event | Direction | Description |
| :--- | :--- | :--- |
| `connection:ack` | Server → Client | Confirms active socket connection handshake |
| `telemetry:new` | Server → Client | Broadcasts newly generated telemetry record every 3 seconds |
| `telemetry:alert` | Server → Client | Broadcasts anomaly or critical thermal warning event |
| `telemetry:update` | Server → Client | Broadcasts record modifications |
| `telemetry:delete` | Server → Client | Broadcasts record deletions |
| `ping` / `pong` | Bidirectional | Latency measurement heartbeat |

---

## 🏗️ Project Architecture

```text
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/       # Chart.js (Line, Bar, Doughnut, Fleet)
│   │   │   ├── common/       # StatusBadge, ConnectionIndicator, StatCard, Modal, Toast
│   │   │   ├── layout/       # Header, Sidebar, AppLayout
│   │   │   └── telemetry/    # TelemetryTable, Filters, Modal CRUD
│   │   ├── context/          # AuthContext, SocketContext, ThemeContext
│   │   ├── pages/            # Dashboard, TelemetryLogs, AnalyticsView, Settings, Login, Register, Unauthorized, NotFound
│   │   ├── routes/           # ProtectedRoute guard
│   │   ├── services/         # Axios API clients
│   │   ├── index.css         # Tailwind & custom glassmorphism styles
│   │   ├── App.jsx
│   │   └── main.jsx
├── server/
│   ├── config/               # Database connection + in-memory fallback
│   ├── controllers/          # Auth, Telemetry, Analytics
│   ├── middleware/           # JWT verification, Role authorization, Error handler
│   ├── models/               # User, Telemetry Mongoose schemas with compound indexes
│   ├── routes/               # Express REST routes
│   ├── scripts/              # Seed script (750+ records & demo accounts)
│   ├── services/             # Background Telemetry Generator
│   └── server.js             # HTTP & Socket.io server
├── package.json
└── README.md
```
