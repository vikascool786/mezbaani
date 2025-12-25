module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    status: {
      type: DataTypes.ENUM('OPEN', 'BILLED', 'PAID', 'CLOSED'),
      defaultValue: 'OPEN',
    },

    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discountType: {
      type: DataTypes.ENUM('FLAT', 'PERCENT'),
      allowNull: true,
    },

    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    serviceCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },

    gstPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 5,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    serviceCharge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    openedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Order.belongsTo(models.Table, { foreignKey: 'tableId' });
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'orderItems',
    });

    // ✅ DO NOT REMOVE THIS
    Order.belongsToMany(models.MenuItem, {
      through: models.OrderItem,
      as: 'menuItems',
      foreignKey: 'orderId',
    });

    Order.hasMany(models.Payment, {
      foreignKey: 'orderId',
      as: 'payments',
    });
  };

  return Order;
};
