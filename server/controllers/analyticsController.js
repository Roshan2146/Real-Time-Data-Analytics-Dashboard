const Telemetry = require('../models/Telemetry');

// @desc    Get top-level KPI analytics summary
// @route   GET /api/analytics/summary
// @access  Private
exports.getAnalyticsSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [overallStats, statusBreakdown, throughputCount, distinctDevices] = await Promise.all([
      // Aggregation for overall telemetry values & temperature
      Telemetry.aggregate([
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            avgTemperature: { $avg: '$temperature' },
            minTemperature: { $min: '$temperature' },
            maxTemperature: { $max: '$temperature' },
            totalAlerts: {
              $sum: { $cond: [{ $eq: ['$alert.isTriggered', true] }, 1, 0] },
            },
            criticalAlerts: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$alert.isTriggered', true] },
                      { $eq: ['$alert.severity', 'critical'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Aggregation for status counts
      Telemetry.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Throughput in last 1 hour
      Telemetry.countDocuments({
        timestamp: { $gte: oneHourAgo },
      }),

      // Count of distinct active devices
      Telemetry.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$deviceId',
            latestStatus: { $first: '$status' },
          },
        },
      ]),
    ]);

    const stats = overallStats[0] || {
      totalRecords: 0,
      avgValue: 0,
      minValue: 0,
      maxValue: 0,
      avgTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0,
      totalAlerts: 0,
      criticalAlerts: 0,
    };

    // Calculate active vs inactive devices based on latest status
    let activeDevices = 0;
    let warningDevices = 0;
    let offlineDevices = 0;
    let idleDevices = 0;

    distinctDevices.forEach((d) => {
      if (d.latestStatus === 'Active') activeDevices++;
      else if (d.latestStatus === 'Warning') warningDevices++;
      else if (d.latestStatus === 'Offline') offlineDevices++;
      else if (d.latestStatus === 'Idle') idleDevices++;
    });

    const statusMap = { Active: 0, Idle: 0, Warning: 0, Offline: 0 };
    statusBreakdown.forEach((item) => {
      if (item._id) statusMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecords: stats.totalRecords,
        avgValue: Number(stats.avgValue ? stats.avgValue.toFixed(2) : 0),
        minValue: Number(stats.minValue ? stats.minValue.toFixed(2) : 0),
        maxValue: Number(stats.maxValue ? stats.maxValue.toFixed(2) : 0),
        avgTemperature: Number(stats.avgTemperature ? stats.avgTemperature.toFixed(2) : 0),
        minTemperature: Number(stats.minTemperature ? stats.minTemperature.toFixed(2) : 0),
        maxTemperature: Number(stats.maxTemperature ? stats.maxTemperature.toFixed(2) : 0),
        totalAlerts: stats.totalAlerts,
        criticalAlerts: stats.criticalAlerts,
        activeDevices,
        warningDevices,
        offlineDevices,
        idleDevices,
        totalDevices: distinctDevices.length,
        statusBreakdown: statusMap,
        throughputLastHour: throughputCount,
        throughputPerMinute: Number((throughputCount / 60).toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time-series trends for charts
// @route   GET /api/analytics/trends
// @access  Private
exports.getTrends = async (req, res, next) => {
  try {
    const { range = '24h', deviceId, category } = req.query;
    const now = new Date();
    let startDate = new Date();
    let dateFormat = '%Y-%m-%d %H:00'; // Default hourly

    if (range === '1h') {
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      dateFormat = '%H:%M';
    } else if (range === '6h') {
      startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      dateFormat = '%H:%M';
    } else if (range === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dateFormat = '%m-%d %H:00';
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFormat = '%m-%d';
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFormat = '%Y-%m-%d';
    }

    const matchStage = {
      timestamp: { $gte: startDate, $lte: now },
    };

    if (deviceId && deviceId !== 'all') {
      matchStage.deviceId = deviceId;
    }
    if (category && category !== 'all') {
      matchStage.category = category;
    }

    const trends = await Telemetry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' },
          },
          avgValue: { $avg: '$value' },
          maxValue: { $max: '$value' },
          minValue: { $min: '$value' },
          avgTemperature: { $avg: '$temperature' },
          count: { $sum: 1 },
          alertCount: {
            $sum: { $cond: [{ $eq: ['$alert.isTriggered', true] }, 1, 0] },
          },
          timestamp: { $min: '$timestamp' },
        },
      },
      { $sort: { timestamp: 1 } },
      {
        $project: {
          _id: 0,
          label: '$_id',
          timestamp: 1,
          avgValue: { $round: ['$avgValue', 2] },
          maxValue: { $round: ['$maxValue', 2] },
          minValue: { $round: ['$minValue', 2] },
          avgTemperature: { $round: ['$avgTemperature', 2] },
          count: 1,
          alertCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      range,
      count: trends.length,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get telemetry data grouped by category
// @route   GET /api/analytics/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Telemetry.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          avgTemperature: { $avg: '$temperature' },
          totalAlerts: {
            $sum: { $cond: [{ $eq: ['$alert.isTriggered', true] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          avgValue: { $round: ['$avgValue', 2] },
          avgTemperature: { $round: ['$avgTemperature', 2] },
          totalAlerts: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comparison metrics across devices
// @route   GET /api/analytics/devices
// @access  Private
exports.getDevicesAnalytics = async (req, res, next) => {
  try {
    const devices = await Telemetry.aggregate([
      {
        $group: {
          _id: '$deviceId',
          deviceName: { $first: '$deviceName' },
          category: { $first: '$category' },
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          avgTemperature: { $avg: '$temperature' },
          totalAlerts: {
            $sum: { $cond: [{ $eq: ['$alert.isTriggered', true] }, 1, 0] },
          },
        },
      },
      { $sort: { avgValue: -1 } },
      {
        $project: {
          _id: 0,
          deviceId: '$_id',
          deviceName: 1,
          category: 1,
          count: 1,
          avgValue: { $round: ['$avgValue', 2] },
          avgTemperature: { $round: ['$avgTemperature', 2] },
          totalAlerts: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    next(error);
  }
};
