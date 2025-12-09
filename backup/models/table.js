module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define('Table', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING, // e.g., T1, T2
    section: DataTypes.STRING,
    seats: DataTypes.INTEGER,
    isOccupied: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  Table.associate = (models) => {
    Table.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Table.belongsTo(models.Waiter, { foreignKey: 'waiterId' }); // optional
  };

  return Table;
};
