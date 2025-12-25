const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET all items
router.get('/', authenticateToken, menuItemController.getAllMenuItems);

// GET single item by ID
router.get('/:id', authenticateToken, menuItemController.getMenuItemById);

router.post(
    "/",
    authenticateToken,
    authorizeRole(["owner", "admin"]),
    menuItemController.createMenuItem
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRole(["owner", "admin"]),
    menuItemController.updateMenuItem
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole(["owner", "admin"]),
    menuItemController.deleteMenuItem
);

module.exports = router;
