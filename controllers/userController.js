const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');

exports.createStaff = async (req, res) => {
  try {
    // only owner/admin reach here (route guarded)
    const { name, email, phone, password, roleName } = req.body;
    const creator = req.user; // set by authenticateToken

    if (!name || !phone || !password || !roleName) {
      return res.status(400).json({ error: 'name, phone, password and roleName are required' });
    }

    // check duplicates
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) return res.status(400).json({ error: 'Phone already registered' });

    const existingEmail = email ? await User.findOne({ where: { email } }) : null;
    if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

    // find role (by name)
    const role = await Role.findOne({ where: { roleName } });
    if (!role) return res.status(400).json({ error: 'Invalid roleName' });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user associated to same restaurant as creator
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashed,
      roleId: role.id,
      restaurantId: creator.restaurantId,
      isVerified: true,          // created by admin → already active
      verificationToken: null
    });

    // return user without password
    const { id, roleId, restaurantId, isVerified, createdAt } = newUser;
    return res.status(201).json({
      id,
      name,
      email,
      phone,
      roleName: role.roleName,
      roleId,
      restaurantId,
      isVerified,
      createdAt
    });
  } catch (err) {
    console.error('createStaff error', err);
    return res.status(500).json({ error: err.message });
  }
};
