const { Role } = require("../models");

exports.getAllRoles = async (req, res) => {
  const roles = await Role.findAll();
  res.json({ roles });
};
