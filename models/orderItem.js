module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    originalQuantity: { type: DataTypes.INTEGER, allowNull: true },
    quantityPrinted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // for KOT tracking
    },
    quantityServed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quantityCancelled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
    OrderItem.belongsTo(models.MenuItem, { foreignKey: 'menuItemId' });
  };

  return OrderItem;
};
