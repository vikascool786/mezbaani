module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define(
    "Table",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      section: DataTypes.STRING,
      seats: DataTypes.INTEGER,
      isOccupied: { type: DataTypes.BOOLEAN, defaultValue: false },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["name", "restaurantId"],
        },
      ],
    }
  );

  Table.associate = (models) => {
    Table.belongsTo(models.Restaurant, { foreignKey: "restaurantId" });
    Table.belongsTo(models.User, {
      foreignKey: "userId",
      as: "assignedUser",
    });
  };

  return Table;
};
