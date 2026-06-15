const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middlewares/authMiddleware");
const { getHRData, getAllData, getUserData, checkNotification, updateData, deleteData } = require("../controller/dashboardController");

router.get("/mydata", authMiddleware, getUserData);
router.get("/hrdata", authMiddleware, authorizeRoles("HR"), getHRData);
router.get("/all", authMiddleware, authorizeRoles("admin", "super-admin"), getAllData);
router.get("/checkNotification", authMiddleware, authorizeRoles("admin", "super-admin"), checkNotification);
router.put("/:module/:id", authMiddleware, updateData);
router.delete("/:module/:id", authMiddleware, deleteData);

module.exports = router;
