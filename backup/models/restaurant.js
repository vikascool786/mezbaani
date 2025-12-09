module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
  });

  Restaurant.associate = (models) => {
    Restaurant.hasMany(models.Captain, { foreignKey: 'restaurantId' });
    Restaurant.hasMany(models.Waiter, { foreignKey: 'restaurantId' });
    Restaurant.hasMany(models.Table, { foreignKey: 'restaurantId' });
    Restaurant.hasMany(models.MenuCategory, { foreignKey: 'restaurantId' });
  };

  return Restaurant;
};