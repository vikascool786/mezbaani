const { Restaurant } = require('../models');

// GET all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err });
  }
};

// POST: Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, location } = req.body;

    const newRestaurant = await Restaurant.create({ name, location });

    res.status(201).json(newRestaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error creating restaurant', error: err });
  }
};

// PUT: Update a restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.name = name || restaurant.name;
    restaurant.location = location || restaurant.location;

    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error updating restaurant', error: err });
  }
};

// DELETE: Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await restaurant.destroy();
    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting restaurant', error: err });
  }
};
