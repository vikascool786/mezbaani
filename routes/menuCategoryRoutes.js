const express = require('express');
const router = express.Router();
const menuCategoryController = require('../controllers/menuCategoryController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, menuCategoryController.getAllMenuCategories);
router.get('/:id', authenticateToken, menuCategoryController.getMenuCategoryById);

router.post(
  '/',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  menuCategoryController.createMenuCategory
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  menuCategoryController.updateMenuCategory
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  menuCategoryController.deleteMenuCategory
);

module.exports = router;
