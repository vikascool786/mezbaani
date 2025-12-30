// controllers/tableController.js
const { Table, Restaurant } = require('../models');

// GET all tables
exports.getAllTables = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const tables = await Table.findAll({
      where: { restaurantId: restaurantId },
      order: [['createdAt', 'ASC']],
    });

    return res.json({ tables });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// GET table by ID
exports.getTableById = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const table = await Table.findOne({
      where: {
        id: req.params.id,
        restaurantId: restaurantId,
      },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.json(table);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// POST create table by only admin / owner
// exports.createTable = async (req, res) => {
//   try {
//     const { name, section, seats, restaurantId, userId } = req.body;
//     const newTable = await Table.create({ name, section, seats, restaurantId, userId });
//     res.status(201).json(newTable);
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating table', error: err });
//   }
// };
exports.createTable = async (req, res) => {
  try {
    const { name, section, seats } = req.body;
    const { restaurantId } = req.params;
    const userId = req.user.id;

    console.log(restaurantId, userId);

    // 🔐 SECURITY CHECK
    const restaurant = await Restaurant.findOne({
      where: {
        id: restaurantId,
        user_id: userId, // owner validation
      },
    });

    if (!restaurant) {
      return res.status(403).json({ message: "Not authorized for this restaurant" });
    }

    // 🚫 Duplicate table check
    const exists = await Table.findOne({
      where: { name, restaurantId },
    });

    if (exists) {
      return res.status(400).json({ message: "Table already exists" });
    }

    const table = await Table.create({
      name,
      section,
      seats,
      restaurantId,
      userId,

    });

    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update table
exports.updateTable = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const table = await Table.findOne({
      where: {
        id: req.params.id,
        restaurantId: restaurantId,
      },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const { isOccupied, name, section, seats } = req.body;

    await table.update({
      isOccupied,
      name,
      section,
      seats,
    });

    return res.json(table);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE table
exports.deleteTable = async (req, res) => {
  try {
    const { restaurantId, id } = req.params;
    const userId = req.user.id;

    // 🔐 Step 1: Validate restaurant ownership
    const restaurant = await Restaurant.findOne({
      where: {
        id: restaurantId,
        user_id: userId,
      },
    });

    if (!restaurant) {
      return res.status(403).json({ message: "Not authorized for this restaurant" });
    }

    // 🔍 Step 2: Find table under restaurant
    const table = await Table.findOne({
      where: {
        id,
        restaurantId,
      },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found in this restaurant" });
    }

    // 🗑 Step 3: Delete
    await table.destroy();

    return res.status(200).json({ message: "Table deleted successfully" });

  } catch (err) {
    return res.status(500).json({
      message: "Error deleting table",
      error: err.message,
    });
  }
};