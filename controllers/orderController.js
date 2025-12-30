const { Order, Restaurant, MenuItem, Table, OrderItem, User, sequelize } = require('../models');
const { generateOrderNumber } = require('../utils/generateOrderNumber');
const { Op } = require('sequelize');

/**
 * GET all orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: Table }, { model: User, as: 'user', attributes: ['id', 'name'], }],
      order: [['createdAt', 'DESC']],
    });

    const response = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.findAll({
          where: { orderId: order.id },
          include: [{ model: MenuItem }],
        });

        return {
          ...order.toJSON(),
          items: items.map(i => ({
            menuItemId: i.menuItemId,
            name: i.MenuItem.name,
            price: i.MenuItem.price,
            quantity: i.quantity,
            quantityServed: i.quantityServed,
            quantityCancelled: i.quantityCancelled,
            quantityPrinted: i.quantityPrinted,
          })),
        };
      })
    );

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Table },
        { model: User, as: 'user' },
      ],
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: MenuItem }],
    });

    return res.json({
      ...order.toJSON(),
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.MenuItem.name,
        price: i.MenuItem.price,
        quantity: i.quantity,
        originalQuantity: i.originalQuantity,
        quantityPrinted: i.quantityPrinted,
        quantityServed: i.quantityServed,
        quantityCancelled: i.quantityCancelled,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// GET order by active status 
exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: 'OPEN' },
      include: [
        {
          model: Table,
        },
        {
          model: OrderItem,
          as: 'orderItems', // ✅ REQUIRED
          include: [
            {
              model: MenuItem,
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const response = orders.map(order => {
      const activeItems = order.orderItems
        .map(item => {
          const remainingQty =
            item.quantity -
            item.quantityServed -
            item.quantityCancelled;

          if (remainingQty <= 0) return null;

          return {
            menuItemId: item.menuItemId,
            name: item.MenuItem.name,
            price: Number(item.MenuItem.price),
            orderedQty: item.quantity,
            servedQty: item.quantityServed,
            cancelledQty: item.quantityCancelled,
            remainingQty,
          };
        })
        .filter(Boolean);

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.Table,
        createdAt: order.createdAt,
        items: activeItems,
      };
    });

    return res.json(response);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch active orders',
      error: error.message,
    });
  }
};

/**
 * CREATE order (one OPEN order per table)
 */
exports.createOrder = async (req, res) => {
  const { tableId, items } = req.body;
  const userId = req.user.id;

  const t = await sequelize.transaction();

  try {
    // 1️⃣ Find restaurant owned by logged-in user
    const restaurant = await Restaurant.findOne({
      where: { user_id: userId },
    });

    if (!restaurant) {
      await t.rollback();
      return res.status(403).json({ message: 'Restaurant not found for user' });
    }

    // 2️⃣ Validate table belongs to this restaurant
    const table = await Table.findOne({
      where: {
        id: tableId,
        restaurantId: restaurant.id,
      },
    });

    if (!table) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid table' });
    }

    // 3️⃣ Check for existing OPEN order
    const existingOrder = await Order.findOne({
      where: {
        tableId,
        restaurantId: restaurant.id,
        status: 'OPEN',
      },
    });

    if (existingOrder) {
      await t.rollback();
      return res.json(existingOrder);
    }

    // 4️⃣ Create Order
    const order = await Order.create({
      tableId,
      restaurantId: restaurant.id,
      userId,
      orderNumber: generateOrderNumber(),
      status: 'OPEN',
    }, { transaction: t });

    let subtotal = 0;

    // 5️⃣ Create Order Items
    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        where: {
          id: item.menuItemId,
          restaurantId: restaurant.id,
        },
      });

      if (!menuItem) {
        throw new Error('Invalid menu item');
      }

      subtotal += Number(menuItem.price) * item.quantity;

      await OrderItem.create({
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity: item.quantity,
        originalQuantity: item.quantity,
      }, { transaction: t });
    }

    // 6️⃣ Calculate tax & total
    // 6️⃣ Calculate service charge & GST dynamically
    let serviceCharge = 0;
    let taxAmount = 0;

    // Service Charge
    if (restaurant.isServiceChargeEnabled) {
      serviceCharge =
        (subtotal * Number(restaurant.serviceChargePercent || 0)) / 100;
    }

    // GST
    if (restaurant.isGstEnabled) {
      taxAmount =
        ((subtotal + serviceCharge) * Number(restaurant.gstPercent || 0)) / 100;
    }

    const total = subtotal + serviceCharge + taxAmount;

    await order.update(
      {
        subtotal,
        serviceCharge,
        gstPercent: restaurant.gstPercent,
        taxAmount,
        total,
      },
      { transaction: t }
    );

    // book table as OCCUPIED
    await Table.update(
      { isOccupied: 1 },
      { where: { id: order.tableId }, transaction: t }
    );

    await t.commit();

    return res.status(201).json(order);

  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: err.message });
  }
};

// print KOT 
exports.getKotPreview = async (req, res) => {
  const { id } = req.params;

  const items = await OrderItem.findAll({
    where: { orderId: id },
    include: [{ model: MenuItem }],
  });

  // Only items that still need printing
  const kotItems = items
    .map(item => {
      const pendingQty = item.quantity - item.quantityPrinted;

      if (pendingQty > 0) {
        return {
          // orderItemId: item.orderId,
          menuItemId: item.menuItemId,
          name: item.MenuItem.name,
          originalQuantity: item.originalQuantity,
          quantityPrinted: item.quantityPrinted,
          quantityServed: item.quantityServed,
          quantityCancelled: item.quantityCancelled,
          pendingQty,
        };
      }
      return null;
    })
    .filter(Boolean);

  return res.json({
    orderId: id,
    kotItems,
  });
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { items, discountAmount = 0 } = req.body;

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 🔹 Fetch restaurant settings
    const restaurant = await Restaurant.findByPk(order.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // 🔹 Add / Update order items
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) continue;

      const orderItem = await OrderItem.findOne({
        where: { orderId: id, menuItemId: item.menuItemId },
      });

      if (orderItem) {
        orderItem.quantity += item.quantity;
        orderItem.originalQuantity += item.quantity;
        await orderItem.save();
      } else {
        await OrderItem.create({
          orderId: id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          originalQuantity: item.quantity,
        });
      }
    }

    // 🔁 Recalculate subtotal
    const allItems = await OrderItem.findAll({
      where: { orderId: id },
      include: [{ model: MenuItem }],
    });

    const subtotal = allItems.reduce((sum, item) => {
      return sum + Number(item.MenuItem.price) * item.quantity;
    }, 0);

    // 🔹 Service Charge
    let serviceChargeAmount = 0;
    if (restaurant.isServiceChargeEnabled) {
      serviceChargeAmount =
        (subtotal * restaurant.serviceChargePercent) / 100;
    }

    // 🔹 Discount (applies before GST)
    const discountedSubtotal =
      subtotal + serviceChargeAmount - discountAmount;

    // 🔹 GST
    let gstAmount = 0;
    if (restaurant.isGstEnabled) {
      gstAmount = (discountedSubtotal * restaurant.gstPercent) / 100;
    }

    // 🔹 Final Total
    const total =
      discountedSubtotal + gstAmount;

    // 🔹 Persist calculated values
    await order.update({
      subtotal,
      serviceChargeAmount,
      discountAmount,
      taxAmount: gstAmount,
      total,
    });

    return res.json({
      message: 'Order updated successfully',
      billing: {
        subtotal,
        serviceChargeAmount,
        discountAmount,
        gstAmount,
        total,
      },
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// update kot print quantities
exports.printKot = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(id);

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'CLOSED') {
      await t.rollback();
      return res.status(400).json({ message: 'Cannot print KOT for closed order' });
    }

    const updatedItems = [];

    for (const item of items) {
      const orderItem = await OrderItem.findOne({
        where: {
          orderId: id,
          menuItemId: item.menuItemId,
        },
        transaction: t,
      });

      if (!orderItem) continue;

      const pendingQty =
        orderItem.quantity - orderItem.quantityPrinted - orderItem.quantityCancelled;

      if (pendingQty <= 0) {
        continue; // nothing left to print
      }

      if (item.quantity > pendingQty) {
        await t.rollback();
        return res.status(400).json({
          message: `KOT quantity exceeds pending qty for menuItem ${item.menuItemId}`,
        });
      }

      orderItem.quantityPrinted += item.quantity;
      await orderItem.save({ transaction: t });

      updatedItems.push({
        menuItemId: orderItem.menuItemId,
        printedNow: item.quantity,
        totalPrinted: orderItem.quantityPrinted,
        totalOrdered: orderItem.quantity,
      });
    }

    await t.commit();

    return res.json({
      message: 'KOT printed successfully',
      orderId: id,
      items: updatedItems,
    });

  } catch (err) {
    await t.rollback();
    return res.status(500).json({
      message: 'Failed to print KOT',
      error: err.message,
    });
  }
};



// apply discount to order 
exports.applyDiscount = async (req, res) => {
  const { orderId } = req.params;
  const { discountType, discountValue } = req.body;

  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: Restaurant }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'CLOSED') {
      return res.status(400).json({ message: 'Order is closed' });
    }

    const subtotal = Number(order.subtotal);
    let discountAmount = 0;

    // 1️⃣ Discount calculation
    if (discountType === 'FLAT') {
      discountAmount = discountValue;
    } else if (discountType === 'PERCENT') {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      return res.status(400).json({ message: 'Invalid discount type' });
    }

    if (discountAmount > subtotal) {
      return res.status(400).json({ message: 'Discount exceeds subtotal' });
    }

    const discountedSubtotal = subtotal - discountAmount;

    // 2️⃣ GST recalculation (service charge stays same)
    let taxAmount = 0;
    if (order.Restaurant.isGstEnabled) {
      taxAmount =
        ((discountedSubtotal + order.serviceCharge) *
          Number(order.Restaurant.gstPercent || 0)) / 100;
    }

    const total =
      discountedSubtotal + order.serviceCharge + taxAmount;

    await order.update({
      discountType,
      discountValue,
      discountAmount,
      taxAmount,
      total,
    });

    return res.json({
      message: 'Discount applied successfully',
      orderId: order.id,
      subtotal,
      discountAmount,
      serviceCharge: order.serviceCharge,
      taxAmount,
      total,
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Failed to apply discount',
      error: err.message,
    });
  }
};


/**
 * DELETE order
 */
exports.deleteOrder = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  await order.destroy();
  return res.json({ message: 'Order deleted' });
};

/**
 * GET active order by table
 */
exports.getOrderByTableId = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        tableId: req.params.tableId,
        status: { [Op.ne]: 'CLOSED' },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!order) return res.status(404).json({ message: 'No active order' });

    const items = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: MenuItem }],
    });

    return res.json({
      ...order.toJSON(),
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.MenuItem.name,
        price: i.MenuItem.price,
        quantity: i.quantity,
        quantityServed: i.quantityServed,
        quantityCancelled: i.quantityCancelled,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.getBillPreview = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: Table },
        {
          model: OrderItem,
          as: 'orderItems', // ✅ REQUIRED ALIAS
          include: [
            {
              model: MenuItem,
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = order.orderItems.map(item => ({
      menuItemId: item.menuItemId,
      name: item.MenuItem.name,
      price: Number(item.MenuItem.price),
      quantity: item.quantity,
      served: item.quantityServed,
      cancelled: item.quantityCancelled,
      lineTotal:
        (item.quantity - item.quantityCancelled) *
        Number(item.MenuItem.price),
    }));

    return res.json({
      orderId: order.id,
      tableId: order.tableId,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      items,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};