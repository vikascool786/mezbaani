const { MenuItem, MenuCategory } = require('../models');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.findAll({ include: MenuCategory });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items', error: err });
  }
};

// Get one menu item
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, { include: MenuCategory });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu item', error: err });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, imageUrl, isAvailable, categoryId, restaurantId } = req.body;
    const newItem = await MenuItem.create({ name, price, imageUrl, isAvailable, categoryId, restaurantId });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Error creating menu item', error: err });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, imageUrl, isAvailable } = req.body;
    const updated = await MenuItem.update(
      { name, price, imageUrl, isAvailable },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ message: 'Menu item updated', affected: updated[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating menu item', error: err });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting menu item', error: err });
  }
};
