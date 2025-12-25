// controllers/menuCategoryController.js
const { MenuCategory, Restaurant } = require('../models');

// GET all categories for logged-in user's restaurant
exports.getAllMenuCategories = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Restaurant not found for user' });
    }

    const categories = await MenuCategory.findAll({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      order: [['createdAt', 'ASC']],
    });

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single category (ownership check)
exports.getMenuCategoryById = async (req, res) => {
  try {
    const category = await MenuCategory.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const restaurant = await Restaurant.findOne({
      where: { id: category.restaurantId, user_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE category (owner/admin only)
exports.createMenuCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Restaurant not found' });
    }

    const exists = await MenuCategory.findOne({
      where: { name, restaurantId: restaurant.id },
    });

    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await MenuCategory.create({
      name,
      restaurantId: restaurant.id,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE category
exports.updateMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const restaurant = await Restaurant.findOne({
      where: { id: category.restaurantId, user_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { name, isActive } = req.body;
    await category.update({ name, isActive });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE category (soft logic recommended)
exports.deleteMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const restaurant = await Restaurant.findOne({
      where: { id: category.restaurantId, user_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await category.destroy(); // later we can switch to soft delete
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
