const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/restaurants', require('./restaurantRoutes'));
router.use('/tables', require('./tableRoutes'));
router.use('/menu-categories', require('./menuCategoryRoutes'));
router.use('/menu-items', require('./menuItemRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/order-items', require('./orderItemRoutes')); 
router.use('/roles', require('./roleRoutes'));
// router.use('/subscriptions', require('./subscriptionRoutes'));
// router.use('/payments', require('./paymentRoutes'));

module.exports = router;
