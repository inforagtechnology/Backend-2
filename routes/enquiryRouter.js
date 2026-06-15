const express = require("express");
const { createnquiry, updateenquiry, deleteEnquiry, getAllEnquiries } = require("../controller/enquiryController");
const { authMiddleware, authorizeRoles } = require("../middlewares/authMiddleware");

const enquiryRouter = express.Router();

enquiryRouter.post("/Create_enquiry", authMiddleware, createnquiry);
enquiryRouter.get("/all", authMiddleware, authorizeRoles("admin", "super-admin", "HR"), getAllEnquiries);
enquiryRouter.put("/update_enquiry/:id", authMiddleware, updateenquiry);
enquiryRouter.delete("/delete_enquiry/:id", authMiddleware, deleteEnquiry);

module.exports = enquiryRouter;
