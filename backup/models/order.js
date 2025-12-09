// models/Order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'placed', // placed, served, paid, etc.
    },
    total: DataTypes.FLOAT,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Order.belongsTo(models.Table, { foreignKey: 'tableId' });
    Order.belongsTo(models.Captain, { foreignKey: 'userId', as: 'captain' });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'orderItems', // You can keep this if needed
    });

    // Order.belongsToMany(models.MenuItem, {
    //   through: models.OrderItem,
    //   as: 'items',
    //   foreignKey: 'orderId',
    //   otherKey: 'menuItemId',  
    // });

    Order.belongsToMany(models.MenuItem, {
      through: models.OrderItem,
      as: 'menuItems',       // ✅ this alias matters
      foreignKey: 'orderId',
    });

  };


  return Order;
};
