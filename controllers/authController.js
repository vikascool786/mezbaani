const { User, Role } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  const { name, email, phone, password, roleId, restaurantId } = req.body;

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ error: "Invalid roleId" });
    }


    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      roleId,
      restaurantId,
      verificationToken,
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      msg: "User registered. Please check your email to verify your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        restaurantId: user.restaurantId,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
      include: [{ model: Role, attributes: ["roleName"] }]
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
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        restaurantId: user.restaurantId,
        roleName: user.role.roleName,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error" });
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

