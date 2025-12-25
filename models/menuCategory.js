// models/MenuCategory.js
module.exports = (sequelize, DataTypes) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name', 'restaurantId'], // 🔐 unique per restaurant
      },
    ],
  });

  MenuCategory.associate = (models) => {
    MenuCategory.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
    });
  };

  return MenuCategory;
};
