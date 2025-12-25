const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticateToken } = require('../middleware/auth');

router.post('/:orderId/generate', authenticateToken, billController.generateBill);

module.exports = router;
