const { Restaurant, OrderItem, Order, MenuItem, sequelize } = require('../models');

// GET all order items
exports.getAllOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.findAll({ include: [Order, MenuItem] });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching order items', error: err });
  }
};

// GET single order item
exports.getOrderItemById = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id, { include: [Order, MenuItem] });
    if (!item) return res.status(404).json({ message: 'Order item not found' });
    return res.status(200).json(item);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching order item', error: err });
  }
};

// CREATE a new order item
exports.createOrderItems = async (req, res) => {
  const { orderId, items } = req.body;
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const createdItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Invalid menuItemId: ${item.menuItemId}`);
      }

      const quantity = parseInt(item.quantity);
      if (!quantity || quantity <= 0) {
        throw new Error(`Invalid quantity for ${menuItem.name}`);
      }

      const orderItem = await OrderItem.create(
        {
          orderId,
          menuItemId: item.menuItemId,
          quantity,
          originalQuantity: quantity,
        },
        { transaction: t }
      );

      createdItems.push(orderItem);
    }

    await t.commit();

    return res.status(201).json({
      message: 'Items added to order',
      items: createdItems,
    });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      message: 'Failed to add items',
      error: error.message,
    });
  }
};

// UPDATE order item status
exports.updateOrderItemStatus = async (req, res) => {
  const { orderId, menuItemId } = req.params;
  const {
    quantityServed = 0,
    quantityCancelled = 0,
    quantityPrinted = 0,
  } = req.body;

  try {
    const orderItem = await OrderItem.findOne({
      where: { orderId, menuItemId },
    });

    if (!orderItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    const orderedQty = orderItem.quantity;

    const currentServed = orderItem.quantityServed;
    const currentCancelled = orderItem.quantityCancelled;
    const currentPrinted = orderItem.quantityPrinted;

    // 🔢 Remaining quantity
    const remainingQty =
      orderedQty - (currentServed + currentCancelled);

    // Invalid serve/cancel
    if (quantityServed + quantityCancelled > remainingQty) {
      return res.status(400).json({
        message: 'Served + Cancelled exceeds remaining quantity',
      });
    }

    // Printed qty cannot exceed ordered qty
    if (currentPrinted + quantityPrinted > orderedQty) {
      return res.status(400).json({
        message: 'Printed quantity exceeds ordered quantity',
      });
    }

    // ✅ Increment values
    orderItem.quantityServed = currentServed + quantityServed;
    orderItem.quantityCancelled = currentCancelled + quantityCancelled;
    orderItem.quantityPrinted = currentPrinted + quantityPrinted;

    await orderItem.save();

    // RE-CALCULATE ORDER BILLING BASED ON CANCELLED ITEM
    const order = await Order.findByPk(orderId);
    const restaurant = await Restaurant.findByPk(order.restaurantId);

    const items = await OrderItem.findAll({
      where: { orderId },
      include: [{ model: MenuItem }],
    });

    let subtotal = 0;

    for (const item of items) {
      const chargeableQty =
        item.quantity - item.quantityCancelled;

      subtotal +=
        Number(item.MenuItem.price) * chargeableQty;
    }

    // Service charge
    let serviceCharge = 0;
    if (restaurant.isServiceChargeEnabled) {
      serviceCharge =
        (subtotal * Number(restaurant.serviceChargePercent || 0)) / 100;
    }

    // GST
    let taxAmount = 0;
    if (restaurant.isGstEnabled) {
      taxAmount =
        ((subtotal + serviceCharge) *
          Number(restaurant.gstPercent || 0)) /
        100;
    }

    const total = subtotal + serviceCharge + taxAmount;

    await order.update({
      subtotal,
      serviceCharge,
      taxAmount,
      total,
    });

    return res.json({
      message: 'Order item quantities updated successfully',
      data: {
        orderedQty,
        quantityPrinted: orderItem.quantityPrinted,
        quantityServed: orderItem.quantityServed,
        quantityCancelled: orderItem.quantityCancelled,
        remainingQty:
          orderedQty -
          (orderItem.quantityServed + orderItem.quantityCancelled),
        billing: {
          subtotal,
          serviceCharge,
          taxAmount,
          total,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update order item',
      error: error.message,
    });
  }
};



// DELETE order item
exports.deleteOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Order item not found' });

    await item.destroy();
    return res.status(200).json({ message: 'Order item deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting order item', error: err });
  }
};
