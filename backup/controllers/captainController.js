const { Captain, Restaurant } = require('../models');
const bcrypt = require('bcrypt');

// Get all captains
exports.getAllCaptains = async (req, res) => {
  try {
    const captains = await Captain.findAll({ include: Restaurant });
    res.status(200).json(captains);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching captains', error: err });
  }
};

// Create a captain
exports.createCaptain = async (req, res) => {
  try {
    const { name, phone, email, password, restaurantId } = req.body;

    // Hash the plain password
    const passwordHash = await bcrypt.hash(password, 10);

    const newCaptain = await Captain.create({
      name,
      phone,
      email,
      passwordHash,
      restaurantId,
    });

    res.status(201).json(newCaptain);
  } catch (err) {
    res.status(500).json({ message: 'Error creating captain', error: err });
  }
};

// Update a captain
exports.updateCaptain = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const captain = await Captain.findByPk(id);
    if (!captain) {
      return res.status(404).json({ message: 'Captain not found' });
    }

    await captain.update(updates);
    res.status(200).json(captain);
  } catch (err) {
    res.status(500).json({ message: 'Error updating captain', error: err });
  }
};

// Delete a captain
exports.deleteCaptain = async (req, res) => {
  try {
    const { id } = req.params;

    const captain = await Captain.findByPk(id);
    if (!captain) {
      return res.status(404).json({ message: 'Captain not found' });
    }

    await captain.destroy();
    res.status(200).json({ message: 'Captain deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting captain', error: err });
  }
};
