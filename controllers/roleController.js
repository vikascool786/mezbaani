const { Role } = require("../models");

exports.getAllRoles = async (req, res) => {
  const roles = await Role.findAll();
  res.json({ roles });
};


exports.createRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    const role = await Role.create({ roleName });
    res.status(201).json({ message: "Role created", role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
