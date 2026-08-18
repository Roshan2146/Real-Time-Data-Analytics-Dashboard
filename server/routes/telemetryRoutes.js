const express = require('express');
const router = express.Router();
const {
  getTelemetryList,
  getTelemetryById,
  createTelemetry,
  updateTelemetry,
  deleteTelemetry,
  getTelemetryDevices,
} = require('../controllers/telemetryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require login
router.use(protect);

router.get('/devices', getTelemetryDevices);
router.get('/', getTelemetryList);
router.get('/:id', getTelemetryById);

// Admin-only write/update/delete operations
router.post('/', authorize('admin'), createTelemetry);
router.put('/:id', authorize('admin'), updateTelemetry);
router.delete('/:id', authorize('admin'), deleteTelemetry);

module.exports = router;
