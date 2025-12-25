const { Table, Order, OrderItem, MenuItem, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardTables = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    // 1️⃣ Fetch all tables
    const tables = await Table.findAll({
      where: { restaurantId },
      order: [['createdAt', 'ASC']],
    });

    // 2️⃣ Fetch all OPEN orders for this restaurant
    const orders = await Order.findAll({
      where: {
        restaurantId,
        status: 'OPEN',
      },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: MenuItem }],
        },
      ],
    });

    // 3️⃣ Map orders by tableId
    const orderMap = {};
    orders.forEach(order => {
      orderMap[order.tableId] = order;
    });

    // 4️⃣ Build dashboard response
    const response = tables.map(table => {
      const order = orderMap[table.id];

      if (order) {
        // calculate duration
        const minutes =
          Math.floor((Date.now() - new Date(order.createdAt)) / 60000);

        return {
          id: table.id,
          name: table.name,
          section: table.section,
          seats: table.seats,
          status: 'OCCUPIED',
          isOccupied: table.isOccupied,
          duration: `${minutes} min`,
          customerName: 'Guest', // later from reservation / CRM
          amount: Number(order.total || 0),
          reservationTime: null,
        };
      }

      return {
        id: table.id,
        name: table.name,
        section: table.section,
        seats: table.seats,
        status: 'VACANT',
        isOccupied: table.isOccupied,
        duration: null,
        customerName: null,
        amount: null,
        reservationTime: null,
      };
    });

    res.json({ tables: response });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to load dashboard tables',
      error: err.message,
    });
  }
};
