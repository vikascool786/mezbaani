const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all restaurants
router.get('/', authenticateToken, restaurantController.getAllRestaurants);

// Create restaurant
router.post(
  '/',
  authenticateToken,
  authorizeRole(['owner']),
  restaurantController.createRestaurant
);

// Get my restaurant
router.get(
  '/my',
  authenticateToken,
  authorizeRole(['owner', 'admin', 'staff', 'waiter']),
  restaurantController.getMyRestaurant
);

// Get staff list
router.get(
  '/staff',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  restaurantController.getStaff
);

// Update restaurant
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  restaurantController.updateRestaurant
);

// Delete restaurant
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['owner']),
  restaurantController.deleteRestaurant
);

module.exports = router;
