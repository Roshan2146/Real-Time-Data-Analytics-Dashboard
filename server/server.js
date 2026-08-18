require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { startTelemetryGenerator } = require('./services/telemetryGenerator');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach io instance to express app
app.set('io', io);

// Middlewares
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeSockets: io.engine.clientsCount,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global Centralized Error Handling Middleware
app.use(errorHandler);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);

  socket.emit('connection:ack', {
    status: 'connected',
    socketId: socket.id,
    timestamp: new Date(),
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date() });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id} - Reason: ${reason}`);
  });
});

// Auto-seed if database is empty (works for both local Mongo and In-Memory fallback)
const seedIfEmpty = async () => {
  const User = require('./models/User');
  const Telemetry = require('./models/Telemetry');
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    console.log('[Auto-Seed] Empty database detected. Seeding demo accounts & historical telemetry...');
    const demoUsers = [
      {
        name: 'Alex Mercer (Admin)',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexAdmin',
      },
      {
        name: 'Samantha Ray (Analyst)',
        email: 'analyst@example.com',
        password: 'Analyst@123',
        role: 'analyst',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SamAnalyst',
      },
      {
        name: 'David Vance (Viewer)',
        email: 'viewer@example.com',
        password: 'Viewer@123',
        role: 'viewer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DavidViewer',
      },
    ];

    for (const u of demoUsers) {
      await User.create(u);
    }
    console.log(`[Auto-Seed] Demo accounts created.`);

    const { DEVICE_PROFILES } = require('./services/telemetryGenerator');
    const records = [];
    const now = Date.now();
    for (let i = 0; i < 750; i++) {
      const profile = DEVICE_PROFILES[i % DEVICE_PROFILES.length];
      const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const val = Math.max(10, Math.min(99, profile.baseValue + (Math.random() - 0.5) * 20));
      const temp = Math.max(25, Math.min(90, profile.baseTemp + (Math.random() - 0.5) * 15));
      const isWarn = Math.random() < 0.1;
      
      records.push({
        deviceId: profile.deviceId,
        deviceName: profile.deviceName,
        category: profile.category,
        value: Number(val.toFixed(1)),
        temperature: Number(temp.toFixed(1)),
        status: isWarn ? 'Warning' : 'Active',
        location: profile.location,
        alert: {
          isTriggered: isWarn,
          message: isWarn ? `Thermal spike (${temp.toFixed(1)}°C)` : '',
          severity: isWarn ? 'high' : 'none',
        },
        timestamp,
        createdAt: timestamp,
      });
    }
    records.sort((a, b) => a.timestamp - b.timestamp);
    await Telemetry.insertMany(records);
    console.log(`[Auto-Seed] Populated 750 historical telemetry records.`);
  }
};

// Start Server & Database
const startServer = async () => {
  try {
    await connectDB();
    await seedIfEmpty();

    const interval = parseInt(process.env.TELEMETRY_INTERVAL_MS, 10) || 3000;
    startTelemetryGenerator(io, interval);

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 PulseStream Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 REST API:      http://localhost:${PORT}/api`);
      console.log(`⚡ WebSocket URL: ws://localhost:${PORT}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error(`[Server Boot Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP and Socket server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
