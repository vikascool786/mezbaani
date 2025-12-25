// models/MenuItem.js
module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define("MenuItem", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2), // ✅ billing-safe
      allowNull: false,
    },

    foodType: {
      type: DataTypes.ENUM("veg", "non-veg", "egg", "vegan", "others"),
      allowNull: false,
    },

    imageUrl: {
      type: DataTypes.STRING,
    },

    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  MenuItem.associate = (models) => {
    MenuItem.belongsTo(models.Restaurant, { foreignKey: "restaurantId" });
    MenuItem.belongsTo(models.MenuCategory, { foreignKey: "categoryId" });

    MenuItem.belongsToMany(models.Order, {
      through: models.OrderItem,
      foreignKey: "menuItemId",
      otherKey: "orderId",
    });
    MenuItem.hasMany(models.MenuItemVariant, {
      foreignKey: 'menuItemId',
      as: 'variants',
    });
  };

  return MenuItem;
};
