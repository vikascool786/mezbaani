const { Order, OrderItem, MenuItem, Table } = require('../models');

exports.getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: 'OPEN' },
      include: [
        { model: Table },
        {
          model: OrderItem,
          as: 'orderItems', // ✅ REQUIRED
          include: [{ model: MenuItem }],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    const response = orders
      .map(order => {
        const kitchenItems = order.orderItems
          .map(item => {
            const remainingQty =
              item.quantity -
              item.quantityServed -
              item.quantityCancelled;

            if (remainingQty <= 0) return null;

            return {
              menuItemId: item.menuItemId,
              name: item.MenuItem.name,
              pendingQty: remainingQty,
              printedQty: item.quantityPrinted,
            };
          })
          .filter(Boolean);

        if (kitchenItems.length === 0) return null;

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          table: order.Table,
          items: kitchenItems,
        };
      })
      .filter(Boolean);

    res.json(response);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch kitchen orders',
      error: err.message,
    });
  }
};

