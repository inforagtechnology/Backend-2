const bcrypt = require("bcrypt");
const User = require("../Models/User");

// Only super-admin can create admin or HR accounts
const createAdminOrHR = async (req, res) => {
  try {
    // Only super-admin can create admin/HR
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ msg: "Forbidden: Only super-admin can create admin or HR accounts" });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!["admin", "HR"].includes(role)) {
      return res.status(400).json({ msg: "Role must be 'admin' or 'HR'" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Admin/HR don't need email verification
    });

    await user.save();

    res.status(201).json({
      msg: `${role} account created successfully`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Create admin/HR error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { createAdminOrHR };
