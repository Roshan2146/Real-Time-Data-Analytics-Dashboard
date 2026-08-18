const express = require('express');
const router = express.Router();
const {
  getAnalyticsSummary,
  getTrends,
  getCategories,
  getDevicesAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getAnalyticsSummary);
router.get('/trends', getTrends);
router.get('/categories', getCategories);
router.get('/devices', getDevicesAnalytics);

module.exports = router;
