const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// GET all tables
router.get('/', tableController.getAllTables);

// GET table by ID
router.get('/:id', tableController.getTableById);

// POST create a new table
router.post('/', tableController.createTable);

// PUT update a table
router.put('/:id', tableController.updateTable);

// DELETE a table
router.delete('/:id', tableController.deleteTable);

module.exports = router;
