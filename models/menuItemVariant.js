module.exports = (sequelize, DataTypes) => {
  const MenuItemVariant = sequelize.define('MenuItemVariant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

  MenuItemVariant.associate = (models) => {
    MenuItemVariant.belongsTo(models.MenuItem, {
      foreignKey: 'menuItemId',
    });
  };

  return MenuItemVariant;
};
