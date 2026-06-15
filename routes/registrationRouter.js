const express = require("express");
const {
  createRegistration,
  getRegistrationUser,
  deleteRegistration,
  updateRegistration,
  getRegistrationByMobile,
  getAllRegistrations,
} = require("../controller/registrationController");
const { authMiddleware, authorizeRoles } = require("../middlewares/authMiddleware");

const registrationRouter = express.Router();

registrationRouter.post("/register", authMiddleware, createRegistration);
registrationRouter.get("/get_user/:id", authMiddleware, getRegistrationUser);
registrationRouter.get("/search/:mobile", authMiddleware, getRegistrationByMobile);
registrationRouter.get("/getall_registrations", authMiddleware, authorizeRoles("admin", "super-admin", "HR"), getAllRegistrations);
registrationRouter.put("/update_user/:id", authMiddleware, updateRegistration);
registrationRouter.delete("/delete_user/:id", authMiddleware, authorizeRoles("admin", "super-admin"), deleteRegistration);

module.exports = registrationRouter;
