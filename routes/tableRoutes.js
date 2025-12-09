const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticateToken } = require('../middleware/auth');

// GET all tables
router.get('/', authenticateToken, tableController.getAllTables);

// GET table by ID
router.get('/:id', authenticateToken, tableController.getTableById);

// POST create a new table
router.post('/', authenticateToken, tableController.createTable);

// PUT update a table
router.put('/:id', authenticateToken, tableController.updateTable);

// DELETE a table
router.delete('/:id', authenticateToken, tableController.deleteTable);

module.exports = router;
