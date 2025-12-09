module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: false,  // owner, manager, admin, captain, waiter, kitchen
    },
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'roleId' });
  };

  return Role;
};
