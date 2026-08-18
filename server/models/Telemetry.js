const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: [true, 'Device Name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Server', 'IoT-Sensor', 'Network-Switch', 'Database', 'Industrial-PLC'],
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Telemetry value is required'],
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Active', 'Idle', 'Warning', 'Offline'],
      default: 'Active',
      index: true,
    },
    location: {
      type: String,
      default: 'DataCenter-Primary',
    },
    alert: {
      isTriggered: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: '',
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical', 'none'],
        default: 'none',
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-throughput queries & time-series analytics
telemetrySchema.index({ timestamp: -1 });
telemetrySchema.index({ deviceId: 1, timestamp: -1 });
telemetrySchema.index({ status: 1, timestamp: -1 });
telemetrySchema.index({ category: 1, timestamp: -1 });
telemetrySchema.index({ 'alert.isTriggered': 1, timestamp: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
