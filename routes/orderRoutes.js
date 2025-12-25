const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.get('/active', authenticateToken, orderController.getActiveOrders);
router.get('/', authenticateToken, orderController.getAllOrders);
router.get('/:orderId/bill', authenticateToken, orderController.getBillPreview);
router.get('/table/:tableId', authenticateToken, orderController.getOrderByTableId);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id/kot', authenticateToken, orderController.printKot);


router.post('/', authenticateToken, orderController.createOrder);
router.get('/:id/kot-print', authenticateToken, orderController.getKotPreview);
router.put('/:id', authenticateToken, orderController.updateOrder);
router.delete('/:id', authenticateToken, orderController.deleteOrder);
router.put('/:orderId/discount', authenticateToken, orderController.applyDiscount);


module.exports = router;
