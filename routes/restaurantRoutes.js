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

// Get my restaurants (plural - user can have multiple)
router.get(
  '/my',
  authenticateToken,
  authorizeRole(['owner', 'admin', 'staff', 'waiter']),
  restaurantController.getMyRestaurants
);

// Get single restaurant by ID
router.get(
  '/:id',
  authenticateToken,
  restaurantController.getRestaurantById
);

// Get staff list of a restaurant
router.get(
  '/:restaurantId/staff',
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

router.put(
  '/:restaurantId/settings',
  authenticateToken,
  restaurantController.updateRestaurantSettings
);

module.exports = router;
