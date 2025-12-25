const { Order, OrderItem, MenuItem, sequelize } = require('../models');

const TAX_PERCENT = 5; // configurable later

exports.generateBill = async (req, res) => {
  const { orderId } = req.params;
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'OPEN') {
      return res.status(400).json({ message: 'Bill already generated' });
    }

    const items = await OrderItem.findAll({
      where: { orderId },
      include: [{ model: MenuItem }],
      transaction: t,
    });

    let subtotal = 0;

    for (const item of items) {
      subtotal += Number(item.MenuItem.price) * item.quantity;
    }

    const taxAmount = (subtotal * TAX_PERCENT) / 100;
    const total = subtotal + taxAmount;

    await order.update(
      {
        subtotal,
        taxAmount,
        total,
        status: 'BILLED',
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      message: 'Bill generated successfully',
      bill: {
        orderId: order.id,
        subtotal,
        taxAmount,
        total,
      },
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
