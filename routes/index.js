const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./userRoutes'));
router.use('/restaurants', require('./restaurantRoutes'));
router.use('/tables', require('./tableRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/menu-categories', require('./menuCategoryRoutes'));
router.use('/menu-items', require('./menuItemRoutes'));
router.use('/menu-items-variation', require('./menuitemVariantRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/bill', require('./billRoutes'));
router.use('/payment', require('./paymentRoutes'));
router.use('/order-items', require('./orderItemRoutes')); 
router.use('/roles', require('./roleRoutes'));
router.use('/kitchen', require('./kitchenRoutes'));
// router.use('/subscriptions', require('./subscriptionRoutes'));
// router.use('/payments', require('./paymentRoutes'));

module.exports = router;
