const express = require('express');
const router = express.Router();
const menuItemVariantController = require('../controllers/menuItemVariantController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/:menuItemId', authenticateToken, authorizeRole(["owner", "admin"]), menuItemVariantController.getVariants);
router.post('/', authenticateToken, authorizeRole(["owner", "admin"]), menuItemVariantController.createVariant);
router.put('/:id', authenticateToken, authorizeRole(["owner", "admin"]), menuItemVariantController.updateVariant);
router.delete('/:id', authenticateToken, authorizeRole(["owner", "admin"]), menuItemVariantController.deleteVariant);

module.exports = router;
