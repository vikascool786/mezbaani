// controllers/tableController.js
const { Table } = require('../models');

// GET all tables
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.findAll();
    res.status(200).json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tables', error: err });
  }
};

// GET table by ID
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.status(200).json(table);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching table', error: err });
  }
};

// POST create table
exports.createTable = async (req, res) => {
  try {
    const { name, section, seats, restaurantId } = req.body;
    const newTable = await Table.create({ name, section, seats, restaurantId });
    res.status(201).json(newTable);
  } catch (err) {
    res.status(500).json({ message: 'Error creating table', error: err });
  }
};

// PUT update table
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    const { isOccupied, name, section, seats, restaurantId } = req.body;
    await table.update({ isOccupied, name, section, seats, restaurantId });

    res.status(200).json(table);
  } catch (err) {
    res.status(500).json({ message: 'Error updating table', error: err });
  }
};

// DELETE table
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    await table.destroy();
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting table', error: err });
  }
};
