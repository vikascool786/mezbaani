const { Restaurant, User, Role } = require('../models');
const { sequelize } = require('../models');

// GET all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      limit: 50,
      offset: 0,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });
    return res.status(200).json(restaurants);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

// POST: Create a new restaurant (Owner only)
exports.createRestaurant = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, location, phone, address, logo } = req.body;

    if (!name) {
      await t.rollback();
      return res.status(400).json({ message: 'Restaurant name is required' });
    }

    // Create restaurant with user_id
    const newRestaurant = await Restaurant.create(
      { name, location, phone, address, logo, user_id: req.user?.id },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: newRestaurant,
    });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: 'Error creating restaurant', error: err.message });
  }
};

// GET: All restaurants of current user
exports.getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      where: { user_id: req.user?.id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });

    return res.json({ restaurants });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

// GET: Single restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });

    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    return res.json({ restaurant });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching restaurant', error: err.message });
  }
};

// GET: All staff of a restaurant (owner/admin only)
exports.getStaff = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Verify user owns this restaurant
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    if (req.user?.id !== restaurant.user_id)
      return res.status(403).json({ message: 'You cannot access this restaurant' });

    const staff = await User.findAll({
      where: { restaurantId },
      attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
      include: [{ model: Role, as: 'role', attributes: ['roleName'] }],
    });

    return res.json({ staff });

  } catch (err) {
    return res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// PUT: Update restaurant details
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, phone, address, logo } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    // Prevent updating other users' restaurants
    if (req.user?.id !== restaurant.user_id)
      return res.status(403).json({ message: 'You cannot update this restaurant' });

    restaurant.name = name ?? restaurant.name;
    restaurant.location = location ?? restaurant.location;
    restaurant.phone = phone ?? restaurant.phone;
    restaurant.address = address ?? restaurant.address;
    restaurant.logo = logo ?? restaurant.logo;

    await restaurant.save();

    return res.status(200).json({ message: 'Restaurant updated', restaurant });

  } catch (err) {
    return res.status(500).json({ message: 'Error updating restaurant', error: err.message });
  }
};

// DELETE: Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' });

    // Prevent deleting other users' restaurants
    if (req.user?.id !== restaurant.user_id)
      return res.status(403).json({ message: 'You cannot delete this restaurant' });

    await restaurant.destroy();

    return res.status(200).json({ message: 'Restaurant deleted successfully' });

  } catch (err) {
    return res.status(500).json({ message: 'Error deleting restaurant', error: err.message });
  }
};

// update restaurant settings (GST, service charge)
exports.updateRestaurantSettings = async (req, res) => {
  const userId = req.user.id;
  const { restaurantId } = req.params;

  const {
    gstPercent,
    serviceChargePercent,
    isGstEnabled,
    isServiceChargeEnabled,
  } = req.body;

  try {
    const restaurant = await Restaurant.findOne({
      where: {
        id: restaurantId,
        user_id: userId,
      },
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found or not authorized',
      });
    }

    await restaurant.update({
      gstPercent,
      serviceChargePercent,
      isGstEnabled,
      isServiceChargeEnabled,
    });

    return res.json({
      message: 'Restaurant settings updated successfully',
      restaurantId: restaurant.id,
      settings: {
        gstPercent: restaurant.gstPercent,
        serviceChargePercent: restaurant.serviceChargePercent,
        isGstEnabled: restaurant.isGstEnabled,
        isServiceChargeEnabled: restaurant.isServiceChargeEnabled,
      },
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

