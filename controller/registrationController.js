const Registration = require("../Models/registrationModule");

// ─── Create Registration ──────────────────────────────────────────────────────
const createRegistration = async (req, res) => {
  try {
    const { name, email, course, mobile, registrationFees, paymentMethod, transactionId, examDate } = req.body;

    if (!name || !email || !course || !mobile || !registrationFees || !paymentMethod || !examDate) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    if (paymentMethod === "online" && !transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required for online payment" });
    }

    const emailExists = await Registration.findOne({ email });
    if (emailExists) return res.status(400).json({ success: false, message: "Email already registered" });

    const mobileExists = await Registration.findOne({ mobile });
    if (mobileExists) return res.status(400).json({ success: false, message: "Mobile already registered" });

    const registration = await Registration.create({
      name,
      email,
      course,
      mobile,
      registrationFees,
      paymentMethod,
      transactionId: paymentMethod === "online" ? transactionId : undefined,
      examDate,
      createdBy: req.user?.name || req.user?.role || "User",
    });

    res.status(201).json({ success: true, message: "Registration created successfully", data: registration });
  } catch (error) {
    console.error("Create Registration Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get Single Registration ──────────────────────────────────────────────────
const getRegistrationUser = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Get All Registrations ────────────────────────────────────────────────────
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Update Registration ──────────────────────────────────────────────────────
const updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    Object.assign(registration, { ...req.body, updatedBy: req.user.name || req.user.role });
    const updated = await registration.save();

    res.status(200).json({ success: true, message: "Registration updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete Registration ──────────────────────────────────────────────────────
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });
    res.status(200).json({ success: true, message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Search by Mobile ─────────────────────────────────────────────────────────
const getRegistrationByMobile = async (req, res) => {
  try {
    const registration = await Registration.findOne({ mobile: req.params.mobile });
    if (!registration) return res.status(404).json({ success: false, message: "No user found" });
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createRegistration,
  getRegistrationUser,
  getAllRegistrations,
  updateRegistration,
  deleteRegistration,
  getRegistrationByMobile,
};
