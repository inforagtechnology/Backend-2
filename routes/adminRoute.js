const express = require("express");
const router = express.Router();
const { createAdminOrHR } = require("../controller/adminController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Only super-admin can create admin/HR accounts
router.post("/create", authMiddleware, createAdminOrHR);

module.exports = router;
