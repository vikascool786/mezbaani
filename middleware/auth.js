const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, 'sesssecret');

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: "role" }],
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role.roleName;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }

    next();
  };
};
