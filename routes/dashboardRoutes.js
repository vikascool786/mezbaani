const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get(
  '/tables/:restaurantId',
  authenticateToken,
  dashboardController.getDashboardTables
);

module.exports = router;
