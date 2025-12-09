const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/captains', require('./captainRoutes'));
router.use('/restaurants', require('./restaurantRoutes'));
router.use('/tables', require('./tableRoutes'));
router.use('/waiters', require('./waiterRoutes'));
router.use('/menu-categories', require('./menuCategoryRoutes'));
router.use('/menu-items', require('./menuItemRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/order-items', require('./orderItemRoutes')); 

module.exports = router;
