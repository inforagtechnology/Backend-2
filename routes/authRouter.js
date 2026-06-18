const express = require("express");
const router = express.Router();
const { signup, login, forgotPassword, resetPassword } = require("../controller/authcontroller");

router.post("/signup", signup);
router.post("/login", login);
// router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
