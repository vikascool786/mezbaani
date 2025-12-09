// models/Waiter.js
module.exports = (sequelize, DataTypes) => {
  const Waiter = sequelize.define('Waiter', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
  });

  Waiter.associate = (models) => {
    Waiter.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      onDelete: 'CASCADE',
    });
  };

  return Waiter;
};
