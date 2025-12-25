const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/:restaurantId', authenticateToken, tableController.getAllTables);
router.get('/:restaurantId/:id', authenticateToken, tableController.getTableById);

router.post('/:restaurantId', authenticateToken, authorizeRole(["owner", "admin"]), tableController.createTable);
router.put('/:restaurantId/:id', authenticateToken, authorizeRole(["owner", "admin"]), tableController.updateTable);
router.delete('/:restaurantId/:id', authenticateToken, authorizeRole(["owner", "admin"]), tableController.deleteTable);

module.exports = router;
