const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, kitchenController.getKitchenOrders);

module.exports = router;
