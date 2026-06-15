const express = require("express");
const { createAdmission, getAdmissions, updateAdmission, deleteAdmission, getAdmissionByMobile } = require("../controller/admissionController");
const { authMiddleware, authorizeRoles } = require("../middlewares/authMiddleware");

const admissionRouter = express.Router();

admissionRouter.post("/admission_create", authMiddleware, createAdmission);
admissionRouter.get("/all", authMiddleware, authorizeRoles("admin", "super-admin", "HR"), getAdmissions);
admissionRouter.put("/update_admission/:id", authMiddleware, updateAdmission);
admissionRouter.delete("/delete_admission/:id", authMiddleware, deleteAdmission);
admissionRouter.get("/search/:mobile", authMiddleware, getAdmissionByMobile);

module.exports = admissionRouter;
