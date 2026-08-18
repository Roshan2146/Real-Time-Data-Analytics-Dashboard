const Telemetry = require('../models/Telemetry');

// @desc    Get paginated, filtered, and sorted telemetry records
// @route   GET /api/telemetry
// @access  Private (All authenticated roles)
exports.getTelemetryList = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      status,
      deviceId,
      startDate,
      endDate,
      sortBy = 'timestamp',
      order = 'desc',
      hasAlert,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    // Construct filter query
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (deviceId && deviceId !== 'all') {
      filter.deviceId = deviceId;
    }

    if (hasAlert === 'true') {
      filter['alert.isTriggered'] = true;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Search query across deviceName, deviceId, location, or alert message
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { deviceName: searchRegex },
        { deviceId: searchRegex },
        { location: searchRegex },
        { 'alert.message': searchRegex },
      ];
    }

    // Sorting
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Parallel execution for total count and paginated items
    const [telemetryRecords, totalCount] = await Promise.all([
      Telemetry.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Telemetry.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      success: true,
      count: telemetryRecords.length,
      total: totalCount,
      page: pageNumber,
      totalPages: totalPages === 0 ? 1 : totalPages,
      hasMore: pageNumber < totalPages,
      data: telemetryRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single telemetry record by ID
// @route   GET /api/telemetry/:id
// @access  Private
exports.getTelemetryById = async (req, res, next) => {
  try {
    const record = await Telemetry.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Telemetry record with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new telemetry record (Admin only)
// @route   POST /api/telemetry
// @access  Private (Admin)
exports.createTelemetry = async (req, res, next) => {
  try {
    const {
      deviceId,
      deviceName,
      category,
      value,
      temperature,
      status,
      location,
      alert,
      timestamp,
    } = req.body;

    const newRecord = await Telemetry.create({
      deviceId,
      deviceName,
      category,
      value: Number(value),
      temperature: Number(temperature),
      status: status || 'Active',
      location: location || 'DataCenter-1',
      alert: alert || { isTriggered: false, message: '', severity: 'none' },
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // Broadcast through socket.io if available on app
    const io = req.app.get('io');
    if (io) {
      io.emit('telemetry:new', newRecord);
      if (newRecord.alert && newRecord.alert.isTriggered) {
        io.emit('telemetry:alert', newRecord);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Telemetry record created successfully',
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update telemetry record (Admin only)
// @route   PUT /api/telemetry/:id
// @access  Private (Admin)
exports.updateTelemetry = async (req, res, next) => {
  try {
    const updatedRecord = await Telemetry.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: `Telemetry record with ID ${req.params.id} not found`,
      });
    }

    // Broadcast updated event
    const io = req.app.get('io');
    if (io) {
      io.emit('telemetry:update', updatedRecord);
    }

    res.status(200).json({
      success: true,
      message: 'Telemetry record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete telemetry record (Admin only)
// @route   DELETE /api/telemetry/:id
// @access  Private (Admin)
exports.deleteTelemetry = async (req, res, next) => {
  try {
    const record = await Telemetry.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Telemetry record with ID ${req.params.id} not found`,
      });
    }

    // Broadcast deleted event
    const io = req.app.get('io');
    if (io) {
      io.emit('telemetry:delete', { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Telemetry record deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct devices with latest status
// @route   GET /api/telemetry/devices
// @access  Private
exports.getTelemetryDevices = async (req, res, next) => {
  try {
    const devices = await Telemetry.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$deviceId',
          deviceName: { $first: '$deviceName' },
          category: { $first: '$category' },
          latestStatus: { $first: '$status' },
          latestValue: { $first: '$value' },
          latestTemperature: { $first: '$temperature' },
          latestTimestamp: { $first: '$timestamp' },
          location: { $first: '$location' },
          totalAlerts: {
            $sum: { $cond: [{ $eq: ['$alert.isTriggered', true] }, 1, 0] },
          },
          totalRecords: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
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
