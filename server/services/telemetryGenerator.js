const Telemetry = require('../models/Telemetry');

// Device configurations for realistic simulation
const DEVICE_PROFILES = [
  {
    deviceId: 'Device-001',
    deviceName: 'Core App Server #1',
    category: 'Server',
    location: 'US-East-1',
    baseValue: 45,
    baseTemp: 52,
    volatility: 8,
  },
  {
    deviceId: 'Device-002',
    deviceName: 'Edge IoT Thermal Node',
    category: 'IoT-Sensor',
    location: 'Factory-Floor-A',
    baseValue: 62,
    baseTemp: 44,
    volatility: 12,
  },
  {
    deviceId: 'Device-003',
    deviceName: '100GbE Switch Backbone',
    category: 'Network-Switch',
    location: 'Rack-42-Central',
    baseValue: 78,
    baseTemp: 58,
    volatility: 6,
  },
  {
    deviceId: 'Device-004',
    deviceName: 'MongoDB Primary Cluster',
    category: 'Database',
    location: 'US-East-1',
    baseValue: 55,
    baseTemp: 64,
    volatility: 10,
  },
  {
    deviceId: 'Device-005',
    deviceName: 'Industrial PLC Controller',
    category: 'Industrial-PLC',
    location: 'Assembly-Sector-3',
    baseValue: 35,
    baseTemp: 41,
    volatility: 5,
  },
  {
    deviceId: 'Device-006',
    deviceName: 'EU Cloud Edge Gateway',
    category: 'Server',
    location: 'EU-Central-1',
    baseValue: 50,
    baseTemp: 49,
    volatility: 9,
  },
];

let generatorInterval = null;

const generateRealisticRecord = () => {
  // Pick random device profile
  const profile = DEVICE_PROFILES[Math.floor(Math.random() * DEVICE_PROFILES.length)];
  
  // Realistic normal distribution wiggle
  const randomWiggle = (Math.random() - 0.5) * 2 * profile.volatility;
  const tempWiggle = (Math.random() - 0.5) * 2 * 4;

  let value = Math.max(5, Math.min(100, profile.baseValue + randomWiggle));
  let temperature = Math.max(20, Math.min(95, profile.baseTemp + tempWiggle));

  // Determine status & potential alerts
  let status = 'Active';
  let isTriggered = false;
  let alertMessage = '';
  let severity = 'none';

  // 12% probability of anomaly or spike
  const anomalyRoll = Math.random();
  if (anomalyRoll < 0.05) {
    // Critical alert
    value = Math.min(100, value + 30);
    temperature = Math.min(95, temperature + 25);
    status = 'Warning';
    isTriggered = true;
    severity = 'critical';
    alertMessage = `High thermal threshold exceeded (${temperature.toFixed(1)}°C) on ${profile.deviceName}`;
  } else if (anomalyRoll < 0.10) {
    // Medium warning
    value = Math.min(98, value + 20);
    status = 'Warning';
    isTriggered = true;
    severity = 'high';
    alertMessage = `Throughput anomaly detected (${value.toFixed(1)}%) on ${profile.deviceName}`;
  } else if (anomalyRoll < 0.15) {
    // Idle or offline
    status = Math.random() > 0.4 ? 'Idle' : 'Active';
  }

  return {
    deviceId: profile.deviceId,
    deviceName: profile.deviceName,
    category: profile.category,
    value: Number(value.toFixed(1)),
    temperature: Number(temperature.toFixed(1)),
    status,
    location: profile.location,
    alert: {
      isTriggered,
      message: alertMessage,
      severity,
    },
    timestamp: new Date(),
  };
};

const startTelemetryGenerator = (io, intervalMs = 3000) => {
  if (generatorInterval) {
    clearInterval(generatorInterval);
  }

  console.log(`[Telemetry Generator] Started real-time stream simulation every ${intervalMs}ms`);

  generatorInterval = setInterval(async () => {
    try {
      const mockData = generateRealisticRecord();
      
      // Save directly to MongoDB
      const record = await Telemetry.create(mockData);

      // Broadcast to all connected socket clients
      if (io) {
        io.emit('telemetry:new', record);
        
        if (record.alert && record.alert.isTriggered) {
          io.emit('telemetry:alert', record);
        }
      }
    } catch (error) {
      console.error('[Telemetry Generator] Error generating record:', error.message);
    }
  }, intervalMs);
};

const stopTelemetryGenerator = () => {
  if (generatorInterval) {
    clearInterval(generatorInterval);
    generatorInterval = null;
    console.log('[Telemetry Generator] Stopped generator stream');
  }
};

module.exports = {
  startTelemetryGenerator,
  stopTelemetryGenerator,
  generateRealisticRecord,
  DEVICE_PROFILES,
};
