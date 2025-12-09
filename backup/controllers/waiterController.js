const { Waiter, Restaurant } = require('../models');

// GET all waiters
exports.getAllWaiters = async (req, res) => {
  try {
    const waiters = await Waiter.findAll({ include: Restaurant });
    res.status(200).json(waiters);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching waiters', error: err });
  }
};

// GET waiter by ID
exports.getWaiterById = async (req, res) => {
  try {
    const waiter = await Waiter.findByPk(req.params.id, { include: Restaurant });
    if (!waiter) return res.status(404).json({ message: 'Waiter not found' });
    res.status(200).json(waiter);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching waiter', error: err });
  }
};

// CREATE waiter
exports.createWaiter = async (req, res) => {
  try {
    const { name, phone, email, restaurantId } = req.body;

    const newWaiter = await Waiter.create({
      name,
      phone,
      email,
      restaurantId,
    });

    res.status(201).json(newWaiter);
  } catch (err) {
    res.status(500).json({ message: 'Error creating waiter', error: err });
  }
};

// UPDATE waiter
exports.updateWaiter = async (req, res) => {
  try {
    const { name, phone, email, restaurantId } = req.body;

    const waiter = await Waiter.findByPk(req.params.id);
    if (!waiter) return res.status(404).json({ message: 'Waiter not found' });

    await waiter.update({ name, phone, email, restaurantId });
    res.status(200).json(waiter);
  } catch (err) {
    res.status(500).json({ message: 'Error updating waiter', error: err });
  }
};

// DELETE waiter
exports.deleteWaiter = async (req, res) => {
  try {
    const waiter = await Waiter.findByPk(req.params.id);
    if (!waiter) return res.status(404).json({ message: 'Waiter not found' });

    await waiter.destroy();
    res.status(200).json({ message: 'Waiter deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting waiter', error: err });
  }
};
