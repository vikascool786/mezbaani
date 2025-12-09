const { Order, MenuItem, Table, OrderItem, User } = require('../models');
const { sequelize, Op } = require('../models');
const { printReceipt, printKOT } = require('../utils/printer');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Table }
      ],
    });

    // For each order, fetch and group its items
    const response = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.findAll({
          where: { orderId: order.id },
          include: [{ model: MenuItem }],
        });

        const groupedItems = {};

        for (const item of orderItems) {
          const menuItemId = item.menuItemId;
          if (!groupedItems[menuItemId]) {
            groupedItems[menuItemId] = {
              menuItemId,
              name: item.MenuItem.name,
              imageUrl: item.MenuItem.imageUrl,
              price: item.MenuItem.price,
              quantity: 0,
              quantityServed: item.quantityServed,
              quantityCancelled: item.quantityCancelled,
            };
          }
          groupedItems[menuItemId].quantity += item.quantity;
        }

        return {
          ...order.toJSON(),
          items: Object.values(groupedItems),
        };
      })
    );

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};


// GET order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: Table },
        { model: User, as: 'user' }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderItems = await OrderItem.findAll({
      where: { orderId: id },
      include: [{ model: MenuItem }]
    });

    // Group by menuItemId
    const groupedItems = {};
    for (const item of orderItems) {
      const menuItemId = item.menuItemId;

      if (!groupedItems[menuItemId]) {
        groupedItems[menuItemId] = {
          menuItemId,
          name: item.MenuItem.name,
          price: item.MenuItem.price,
          imageUrl: item.MenuItem.imageUrl,
          quantity: 0,
          quantityPrinted: item.quantityPrinted || 0,
          quantityServed: item.quantityServed || 0,
          quantityCancelled: item.quantityCancelled || 0,
          originalQuantity: item.originalQuantity || 0,
          
        };
      }

      groupedItems[menuItemId].quantity += item.quantity;
    }

    res.json({
      ...order.toJSON(),
      items: Object.values(groupedItems)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// POST: Create new order
exports.createOrder = async (req, res) => {
  const { tableId, userId, restaurantId, items } = req.body;

  const t = await sequelize.transaction();

  try {
    let total = 0;

    // Step 1: Create order
    const order = await Order.create(
      {
        status: 'placed',
        tableId,
        userId,
        restaurantId,
        total: 0, // placeholder for now
      },
      { transaction: t }
    );

    // Step 2: Add order items with quantity
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Invalid menuItemId: ${item.menuItemId}`);
      }

      await OrderItem.create(
        {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          originalQuantity: item.quantity,
        },
        { transaction: t }
      );

      total += menuItem.price * item.quantity;
    }


    // Step 3: Update order total
    await order.update({ total }, { transaction: t });

    await t.commit();

    // ✅ Step 4: Fetch OrderItems and related MenuItems manually
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
    });

    const menuItemIds = orderItems.map(item => item.menuItemId);
    const menuItems = await MenuItem.findAll({
      where: { id: menuItemIds },
    });

    // ✅ Step 5: Merge OrderItems + MenuItem details into printable structure
    const detailedItems = orderItems.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return {
        name: menuItem?.name || 'Unknown',
        price: menuItem?.price || 0,
        quantity: item.quantity,
      };
    });

    const finalOrder = {
      id: order.id,
      tableId: order.tableId,
      total: order.total,
      items: detailedItems,
    };

    // ✅ Step 6: Print the receipt
    try {
      printKOT(finalOrder)
        .then(() => console.log('KOT printed successfully'))
        .catch(printErr => console.error('Error printing KOT:', printErr.message));

      printReceipt(finalOrder)
        .then(() => console.log('Receipt printed successfully'))
        .catch(printErr => console.error('Error printing Receipt:', printErr.message));

    } catch (printErr) {
      console.error('An unexpected error occurred during printing attempt (likely already handled by .catch()):', printErr.message);
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// PUT: Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, total, tableId, items } = req.body;

    const order = await Order.findByPk(id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status || order.status;
    order.total = total || order.total;
    if (tableId) order.tableId = tableId;
    await order.save();

    const existingItems = await OrderItem.findAll({ where: { orderId: order.id } });

    const updates = [];

    for (const item of items) {
      const existing = existingItems.find(i => i.menuItemId === item.menuItemId);

      if (existing) {
        // ✅ Preserve status fields, only update quantity
        existing.quantity = item.quantity;
        // existing.originalQuantity = item.quantity;
        updates.push(existing.save());
      } else {
        // ✅ New item
        updates.push(OrderItem.create({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          quantityServed: 0,
          quantityCancelled: 0,
          quantityPrinted: 0,
          originalQuantity: item.quantity,
        }));
      }
    }

    await Promise.all(updates);

    res.status(200).json({ message: 'Order updated successfully', order });

  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Error updating order', error: err.message });
  }
};


// DELETE: Remove an order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.destroy();
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order', error: err });
  }
};

// GET order by tableId (latest active order)
exports.getOrderByTableId = async (req, res) => {
  try {
    const { tableId } = req.params;

    const order = await Order.findOne({
      where: { tableId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: Table },
        { model: User, as: 'user' },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'No active order found for this table' });
    }

    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: MenuItem }],
    });

    const groupedItems = {};

    for (const item of orderItems) {
      const menuItemId = item.menuItemId;

      if (!groupedItems[menuItemId]) {
        groupedItems[menuItemId] = {
          menuItemId,
          name: item.MenuItem.name,
          price: item.MenuItem.price,
          imageUrl: item.MenuItem.imageUrl,
          quantity: 0,
          quantityServed: item.MenuItem.quantityServed,
          quantityCancelled: item.MenuItem.quantityCancelled,
        };
      }

      groupedItems[menuItemId].quantity += item.quantity;
    }

    res.json({
      ...order.toJSON(),
      items: Object.values(groupedItems),
    });
  } catch (err) {
    console.error('Error fetching order by tableId:', err);
    res.status(500).json({ message: 'Error fetching order by tableId', error: err.message });
  }
};
