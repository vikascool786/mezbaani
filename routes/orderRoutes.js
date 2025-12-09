const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken,  orderController.getAllOrders);
router.get('/:id', authenticateToken,  orderController.getOrderById);
router.post('/', authenticateToken,  orderController.createOrder);
router.put('/:id', authenticateToken,  orderController.updateOrder);
router.delete('/:id', authenticateToken,  orderController.deleteOrder);
router.get('/table/:tableId', authenticateToken,  orderController.getOrderByTableId);


module.exports = router;
