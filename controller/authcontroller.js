const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../Models/User");
const transporter = require("./nodemailer");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Signup ───────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Email verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const link = `${process.env.BACKEND_URL}/auth/verify/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <h3>Hello ${name},</h3>
        <p>Please click the link below to verify your email:</p>
        <a href="${link}" style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(201).json({ msg: "Signup successful! Check your email to verify your account." });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Error in signup", error: err.message });
  }
};

// ─── Email Verification ───────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ msg: "Invalid token" });

    if (user.isVerified) {
      return res.send("<h2>Email already verified. You can login.</h2>");
    }

    user.isVerified = true;
    await user.save();

    res.send("<h2>✅ Email verified successfully! You can now login.</h2>");
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired verification link" });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (!user.isVerified) {
      return res.status(403).json({ msg: "Please verify your email before logging in" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Login error", error: err.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetLink}" style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>This link expires in 1 hour. Ignore if you didn't request this.</p>
      `,
    });

    res.json({ msg: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ msg: "Forgot password error", error: err.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ msg: "Token and new password are required" });
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired reset link" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successfully. You can now login." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ msg: "Reset password error", error: err.message });
  }
};

module.exports = { signup, verifyEmail, login, forgotPassword, resetPassword };
