const { MenuCategory } = require('../models');

// Get all categories
exports.getAllMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.findAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu categories', error: err });
  }
};

// Get one category
exports.getMenuCategoryById = async (req, res) => {
  try {
    const category = await MenuCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Menu category not found' });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu category', error: err });
  }
};

// Create category
exports.createMenuCategory = async (req, res) => {
  try {
    const { name, restaurantId } = req.body;
    const newCategory = await MenuCategory.create({ name, restaurantId });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Error creating menu category', error: err });
  }
};

// Update category
exports.updateMenuCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await MenuCategory.update({ name }, { where: { id: req.params.id } });
    res.status(200).json({ message: 'Menu category updated', affected: updated[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error updating menu category', error: err });
  }
};

// Delete category
exports.deleteMenuCategory = async (req, res) => {
  try {
    await MenuCategory.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Menu category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting menu category', error: err });
  }
};
