require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Telemetry = require('../models/Telemetry');
const { DEVICE_PROFILES } = require('../services/telemetryGenerator');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime_analytics';
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Seed] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Seed] Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([User.deleteMany({}), Telemetry.deleteMany({})]);

    console.log('[Seed] Creating demo users...');
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
    console.log(`[Seed] Inserted ${demoUsers.length} demo users.`);

    console.log('[Seed] Generating historical telemetry records (700+ entries)...');
    const records = [];
    const totalRecords = 750;
    const now = Date.now();
    const spanDays = 7; // Spread over past 7 days

    for (let i = 0; i < totalRecords; i++) {
      const profile = DEVICE_PROFILES[i % DEVICE_PROFILES.length];
      
      // Calculate timestamp progressively backwards
      const timeOffset = Math.random() * spanDays * 24 * 60 * 60 * 1000;
      const timestamp = new Date(now - timeOffset);

      // Value oscillation with noise
      const hour = timestamp.getHours();
      // diurnal curve pattern
      const diurnalFactor = Math.sin((hour / 24) * Math.PI * 2) * 10;
      const noise = (Math.random() - 0.5) * 12;
      
      let val = Math.max(10, Math.min(99, profile.baseValue + diurnalFactor + noise));
      let temp = Math.max(25, Math.min(90, profile.baseTemp + (val * 0.15) + (Math.random() - 0.5) * 5));

      let status = 'Active';
      let isTriggered = false;
      let alertMessage = '';
      let severity = 'none';

      const roll = Math.random();
      if (roll < 0.06) {
        status = 'Warning';
        temp = Math.min(95, temp + 20);
        val = Math.min(99, val + 25);
        isTriggered = true;
        severity = 'critical';
        alertMessage = `High thermal overload (${temp.toFixed(1)}°C) detected on ${profile.deviceName}`;
      } else if (roll < 0.12) {
        status = 'Warning';
        val = Math.min(98, val + 15);
        isTriggered = true;
        severity = 'high';
        alertMessage = `Bandwidth threshold near saturation (${val.toFixed(1)}%)`;
      } else if (roll < 0.18) {
        status = 'Idle';
      } else if (roll < 0.21) {
        status = 'Offline';
      }

      records.push({
        deviceId: profile.deviceId,
        deviceName: profile.deviceName,
        category: profile.category,
        value: Number(val.toFixed(1)),
        temperature: Number(temp.toFixed(1)),
        status,
        location: profile.location,
        alert: {
          isTriggered,
          message: alertMessage,
          severity,
        },
        timestamp,
        createdAt: timestamp,
      });
    }

    // Sort chronologically for clean database indexing
    records.sort((a, b) => a.timestamp - b.timestamp);

    await Telemetry.insertMany(records);
    console.log(`[Seed] Successfully inserted ${records.length} historical telemetry records.`);

    console.log('\n========================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Demo Accounts Created:');
    console.log('  👑 Admin:   admin@example.com   / Admin@123');
    console.log('  📊 Analyst: analyst@example.com / Analyst@123');
    console.log('  👀 Viewer:  viewer@example.com  / Viewer@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error executing seed script: ${error.message}`);
    process.exit(1);
  }
};

seedData();
