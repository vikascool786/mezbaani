const { OrderItem, Order, MenuItem, sequelize } = require('../models');

// GET all order items
exports.getAllOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.findAll({ include: [Order, MenuItem] });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order items', error: err });
  }
};

// GET single order item
exports.getOrderItemById = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id, { include: [Order, MenuItem] });
    if (!item) return res.status(404).json({ message: 'Order item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order item', error: err });
  }
};

// CREATE a new order item
exports.createOrderItems = async (req, res) => {
  const { orderId, items } = req.body;
  const t = await sequelize.transaction();

  try {
    // Step 1: Validate order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const createdItems = [];

    // Step 2: Loop through items and add to DB
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Invalid menuItemId: ${item.menuItemId}`);
      }

      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.menuItemId}`);
      }

      const price = parseFloat(menuItem.price);
      if (isNaN(price)) {
        throw new Error(`Invalid price for menu item: ${menuItem.id}`);
      }

      const created = await OrderItem.create(
        {
          orderId,
          menuItemId: item.menuItemId,
          quantity,
          price,
          status: item.status || 'added',
        },
        { transaction: t }
      );

      createdItems.push(created);
    }

    // Step 3: Recalculate total for order
    const allOrderItems = await OrderItem.findAll({
      where: { orderId },
      include: [
        {
          model: MenuItem,
          attributes: ['price'],
        },
      ],
      transaction: t,
    });

    const newTotal = allOrderItems.reduce((sum, item) => {
      const price = parseFloat(item.MenuItem?.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    console.log(`New total for order ${orderId}: ${newTotal}`);

    if (isNaN(newTotal)) {
      throw new Error('Calculated total is NaN');
    }

    await order.update({ total: newTotal }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Order items added & total updated',
      updatedTotal: newTotal,
      items: createdItems,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error creating order items', error: err.message });
  }
};

// UPDATE order item
exports.updateOrderItem = async (req, res) => {
  try {
    const { quantity, price, status } = req.body;

    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Order item not found' });

    await item.update({ quantity, price, status });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order item', error: err });
  }
};

// DELETE order item
exports.deleteOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Order item not found' });

    await item.destroy();
    res.status(200).json({ message: 'Order item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order item', error: err });
  }
};
