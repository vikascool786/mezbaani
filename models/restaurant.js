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
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    gstPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.00,
    },
    serviceChargePercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    isGstEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isServiceChargeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    defaultDiscountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
  });

  Restaurant.associate = (models) => {
    Restaurant.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    Restaurant.hasMany(models.Table, { foreignKey: 'restaurantId' });
    Restaurant.hasMany(models.MenuCategory, { foreignKey: 'restaurantId' });
  };

  return Restaurant;
};