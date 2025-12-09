const { Restaurant, User, Role } = require('../models');
const { sequelize } = require('../models');

// GET all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

// POST: Create a new restaurant (Owner only)
exports.createRestaurant = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, location, phone, address } = req.body;

    if (!name) {
      await t.rollback();
      return res.status(400).json({ message: 'Restaurant name is required' });
    }

    // Create restaurant
    const newRestaurant = await Restaurant.create(
      { name, location, phone, address },
      { transaction: t }
    );

    // Assign creating user to this restaurant
    if (req.user?.id) {
      await User.update(
        { restaurantId: newRestaurant.id },
        { where: { id: req.user.id }, transaction: t }
      );
    }

    await t.commit();

    return res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: newRestaurant,
    });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error creating restaurant', error: err.message });
  }
};

// GET: current user's assigned restaurant
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId)
      return res.status(404).json({ message: 'No restaurant assigned' });

    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    return res.json({ restaurant });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurant', error: err.message });
  }
};

// GET: All staff of this restaurant (owner/admin)
exports.getStaff = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId)
      return res.status(404).json({ message: 'No restaurant assigned' });

    const staff = await User.findAll({
      where: { restaurantId },
      attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
      include: [{ model: Role, as: 'role', attributes: ['roleName'] }],
    });

    return res.json({ staff });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// PUT: Update restaurant details
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, phone, address } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    // Prevent updating other restaurants
    if (req.user?.restaurantId !== restaurant.id)
      return res.status(403).json({ message: 'You cannot update this restaurant' });

    restaurant.name = name ?? restaurant.name;
    restaurant.location = location ?? restaurant.location;
    restaurant.phone = phone ?? restaurant.phone;
    restaurant.address = address ?? restaurant.address;

    await restaurant.save();

    res.status(200).json({ message: 'Restaurant updated', restaurant });

  } catch (err) {
    res.status(500).json({ message: 'Error updating restaurant', error: err.message });
  }
};

// DELETE: Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    await restaurant.destroy();

    return res.status(200).json({ message: 'Restaurant deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting restaurant', error: err.message });
  }
};