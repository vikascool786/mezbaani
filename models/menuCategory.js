// models/MenuCategory.js
module.exports = (sequelize, DataTypes) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
  });

  MenuCategory.associate = (models) => {
    MenuCategory.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
    });
  };

  return MenuCategory;
};
