const { MenuItem, MenuCategory, Restaurant } = require('../models');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });
    if (!restaurant) {
      return res.status(403).json({ message: 'Restaurant not found for user' });
    }
    const items = await MenuItem.findAll({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      include: [{ model: MenuCategory }],
      order: [["sortOrder", "ASC"]],
    });

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    const {
      name,
      description,
      price,
      foodType,
      imageUrl,
      categoryId,
      isActive
    } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Restaurant not found for user' });
    }
    // 1. Validate category ownership
    const category = await MenuCategory.findOne({
      where: {
        id: categoryId,
        restaurantId: restaurant.id,
      },
    });

    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      foodType,
      imageUrl,
      categoryId,
      restaurantId: restaurant.id,
      isActive
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });
    if (!restaurant) {
      return res.status(403).json({ message: 'Restaurant not found for user' });
    }
    const item = await MenuItem.findOne({
      where: {
        id: req.params.id,
        restaurantId: restaurant.id,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const { name, description, foodType, price, imageUrl, categoryId, isActive } = req.body;
    await item.update({ name, description, foodType, price , imageUrl, categoryId, isActive});
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
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


// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });
    if (!restaurant) {
      return res.status(403).json({ message: 'Restaurant not found for user' });
    }
    const deleted = await MenuItem.destroy({
      where: {
        id: req.params.id,
        restaurantId: restaurant.id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
