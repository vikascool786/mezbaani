const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken,  orderItemController.getAllOrderItems);
router.get('/:id', authenticateToken,  orderItemController.getOrderItemById);
router.post('/', authenticateToken,  orderItemController.createOrderItems);
// router.put('/:id', authenticateToken,  orderItemController.updateOrderItem);
router.put('/status/:orderId/:menuItemId', orderItemController.updateOrderItemStatus);
router.delete('/:id', authenticateToken,  orderItemController.deleteOrderItem);

module.exports = router;
