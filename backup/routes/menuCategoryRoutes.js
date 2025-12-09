const express = require('express');
const router = express.Router();
const menuCategoryController = require('../controllers/menuCategoryController');

// GET all categories
router.get('/', menuCategoryController.getAllMenuCategories);

// GET single category by ID
router.get('/:id', menuCategoryController.getMenuCategoryById);

// POST create new category
router.post('/', menuCategoryController.createMenuCategory);

// PUT update category
router.put('/:id', menuCategoryController.updateMenuCategory);

// DELETE category
router.delete('/:id', menuCategoryController.deleteMenuCategory);

module.exports = router;
