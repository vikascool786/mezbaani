const express = require('express');
const router = express.Router();
const menuCategoryController = require('../controllers/menuCategoryController');
const { authenticateToken } = require('../middleware/auth');
// GET all categories
router.get('/', authenticateToken, menuCategoryController.getAllMenuCategories);

// GET single category by ID
router.get('/:id', authenticateToken, menuCategoryController.getMenuCategoryById);

// POST create new category
router.post('/', authenticateToken, menuCategoryController.createMenuCategory);

// PUT update category
router.put('/:id', authenticateToken, menuCategoryController.updateMenuCategory);

// DELETE category
router.delete('/:id', authenticateToken, menuCategoryController.deleteMenuCategory);

module.exports = router;
