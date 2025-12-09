const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

// GET all items
router.get('/', menuItemController.getAllMenuItems);

// GET single item by ID
router.get('/:id', menuItemController.getMenuItemById);

// POST create new item
router.post('/', menuItemController.createMenuItem);

// PUT update item
router.put('/:id', menuItemController.updateMenuItem);

// DELETE item
router.delete('/:id', menuItemController.deleteMenuItem);

module.exports = router;
