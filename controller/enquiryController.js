const Enquiry = require("../Models/enquiryModule");

// ─── Create Enquiry ───────────────────────────────────────────────────────────
const createnquiry = async (req, res) => {
  try {
    const { name, email, course, mobile, registrationFees, Enquiry_Message } = req.body;

    if (!name || !email || !course || !mobile || !registrationFees || !Enquiry_Message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      course,
      mobile,
      registrationFees,
      Enquiry_Message,
      createdBy: req.user?.name || req.user?.role || "User",
    });

    res.status(201).json({ success: true, message: "Enquiry created successfully", data: enquiry });
  } catch (error) {
    console.error("Create Enquiry Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get All Enquiries ────────────────────────────────────────────────────────
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Update Enquiry ───────────────────────────────────────────────────────────
const updateenquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });

    Object.assign(enquiry, { ...req.body, updatedBy: req.user.name || req.user.role });
    const updated = await enquiry.save();

    res.status(200).json({ success: true, message: "Enquiry updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete Enquiry ───────────────────────────────────────────────────────────
const deleteEnquiry = async (req, res) => {
  try {
    const role = req.user.role;
    if (!["admin", "super-admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Only admin can delete enquiries" });
    }

    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });

    res.status(200).json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createnquiry, getAllEnquiries, updateenquiry, deleteEnquiry };
