const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { authenticateToken } = require('../middleware/auth');

// GET all items
router.get('/', authenticateToken, menuItemController.getAllMenuItems);

// GET single item by ID
router.get('/:id', authenticateToken, menuItemController.getMenuItemById);

// POST create new item
router.post('/', authenticateToken, menuItemController.createMenuItem);

// PUT update item
router.put('/:id', authenticateToken, menuItemController.updateMenuItem);

// DELETE item
router.delete('/:id', authenticateToken, menuItemController.deleteMenuItem);

module.exports = router;
