const { MenuItemVariant, MenuItem, Restaurant } = require('../models');

// Get variants of a menu item
exports.getVariants = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });

    const item = await MenuItem.findOne({
      where: {
        id: req.params.menuItemId,
        restaurantId: restaurant.id,
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const variants = await MenuItemVariant.findAll({
      where: {
        menuItemId: item.id,
        isActive: true,
      },
      order: [['sortOrder', 'ASC']],
    });

    res.json({ variants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create variant
exports.createVariant = async (req, res) => {
  try {
    const { menuItemId, name, price, isDefault } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { user_id: req.user.id },
    });

    const item = await MenuItem.findOne({
      where: {
        id: menuItemId,
        restaurantId: restaurant.id,
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Ensure only ONE default variant
    if (isDefault) {
      await MenuItemVariant.update(
        { isDefault: false },
        { where: { menuItemId } }
      );
    }

    const variant = await MenuItemVariant.create({
      menuItemId,
      name,
      price,
      isDefault,
    });

    res.status(201).json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update variant
exports.updateVariant = async (req, res) => {
  try {
    const variant = await MenuItemVariant.findByPk(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    if (req.body.isDefault) {
      await MenuItemVariant.update(
        { isDefault: false },
        { where: { menuItemId: variant.menuItemId } }
      );
    }

    await variant.update(req.body);
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Soft delete variant
exports.deleteVariant = async (req, res) => {
  try {
    const deleted = await MenuItemVariant.update(
      { isActive: false },
      { where: { id: req.params.id } }
    );

    if (!deleted[0]) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
