require('dotenv').config();
const { User, Role, Restaurant } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Find owner role
    const ownerRole = await Role.findOne({ where: { roleName: "owner" } });

    if (!ownerRole) {
      return res.status(500).json({ error: "Owner role not configured" });
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // 3. Check if phone already exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number already taken" });
    }

    // 4. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 5. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 6. Create user (not verified yet) - NO restaurant creation
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      roleId: ownerRole.id,
      verificationToken,
      isVerified: false,
    });

    // 7. Send email with token
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      msg: "Account created. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        roleName: "owner",
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.verificationToken = null;
    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone and password are required." });
    }

    const user = await User.findOne({
      where: { phone },
      include: [{ model: Role, as: "role", attributes: ["roleName"] }]
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid phone or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your account first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid phone or password." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        roleName: user.role.roleName,
      },
      (process.env.JWT_SECRET || 'sesssecret'),
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        roleName: user.role.roleName,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error" + err, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, attributes: ["roleName"] }]
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      roleName: user.role.roleName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["roleName"]
        },
        {
          model: Restaurant,
          as: "restaurants",
          attributes: ["id", "name", "location", "address", "phone", "logo"]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.roleName,
      restaurants: user.restaurants
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

