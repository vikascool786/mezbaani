// models/MenuItem.js
module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    imageUrl: DataTypes.STRING,
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  MenuItem.associate = (models) => {
    MenuItem.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'categoryId' });

    MenuItem.belongsToMany(models.Order, {
      through: models.OrderItem,
      foreignKey: 'menuItemId',
      otherKey: 'orderId',
    });
    // MenuItem.belongsToMany(models.Order, {
    //   through: models.OrderItem,
    //   as: 'orders',          // optional alias for reverse side
    //   foreignKey: 'menuItemId',
    // });
  };


  return MenuItem;
};
