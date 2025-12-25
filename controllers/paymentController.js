const { Order, Payment, Table, sequelize } = require('../models');

exports.recordPayment = async (req, res) => {
    const { orderId } = req.params;
    const { paymentMode, amount } = req.body;
    const t = await sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, { transaction: t });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'BILLED') {
            return res.status(400).json({ message: 'Bill not generated yet' });
        }

        await Payment.create(
            {
                orderId,
                paymentMode,
                amount,
            },
            { transaction: t }
        );

        await order.update(
            {
                status: 'PAID',
                closedAt: new Date(),
            },
            { transaction: t }
        );

        //mark table as VACANT
        await Table.update(
            { isOccupied: 0 },
            { where: { id: order.tableId }, transaction: t }
        );

        // 4️⃣ Close order
        await order.update(
            { status: 'CLOSED' },
            { transaction: t }
        );

        await t.commit();

        res.json({ message: 'Payment recorded & order closed' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err.message });
    }
};
