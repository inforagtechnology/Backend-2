const jwt = require("jsonwebtoken");
const User = require("../Models/User");

// Verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ msg: "Unauthorized: User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
  }
};

// Role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Forbidden: You do not have access" });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
