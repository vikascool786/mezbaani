module.exports = (sequelize, DataTypes) => {
  const Captain = sequelize.define('Captain', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
    },
  });

  Captain.associate = (models) => {
    Captain.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Captain.hasMany(models.Order, { foreignKey: 'userId' });
  };

  return Captain;
};