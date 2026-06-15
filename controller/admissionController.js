const Admission = require("../Models/admissionModule");

// ─── Create Admission ─────────────────────────────────────────────────────────
const createAdmission = async (req, res) => {
  try {
    const { fullName, mobile, email, course, payment } = req.body;

    if (!fullName || !mobile || !email || !course || !payment?.firstInstallment) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: "Mobile number must be exactly 10 digits" });
    }

    const mobileExists = await Admission.findOne({ mobile });
    if (mobileExists) return res.status(400).json({ success: false, message: "Mobile already registered" });

    const emailExists = await Admission.findOne({ email });
    if (emailExists) return res.status(400).json({ success: false, message: "Email already registered" });

    // Clean empty second installment
    if (!payment.secondInstallment?.mode || payment.secondInstallment.mode.trim() === "") {
      delete payment.secondInstallment;
    }

    // Validate transactionId for online payments
    for (const inst of ["firstInstallment", "secondInstallment"]) {
      if (payment[inst]?.mode === "online" && !payment[inst]?.transactionId) {
        return res.status(400).json({ success: false, message: `${inst} requires a transaction ID for online payment` });
      }
    }

    const admission = await Admission.create({
      fullName,
      mobile,
      email,
      course,
      payment,
      createdBy: req.user?.name || req.user?.role || "User",
    });

    res.status(201).json({ success: true, message: "Admission created successfully", data: admission });
  } catch (error) {
    console.error("Create Admission Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get All Admissions ───────────────────────────────────────────────────────
const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Update Admission ─────────────────────────────────────────────────────────
const updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });

    const role = req.user.role;
    if (role === "HR") {
      return res.status(403).json({ success: false, message: "HR cannot update admissions" });
    }

    // Validate transactionId if payment included
    const { payment } = req.body;
    if (payment) {
      for (const inst of ["firstInstallment", "secondInstallment"]) {
        if (payment[inst]?.mode === "online" && !payment[inst]?.transactionId) {
          return res.status(400).json({ success: false, message: `${inst} requires a transaction ID for online payment` });
        }
      }
    }

    Object.assign(admission, { ...req.body, updatedBy: req.user.name || req.user.role });
    const updated = await admission.save();

    res.status(200).json({ success: true, message: "Admission updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Delete Admission ─────────────────────────────────────────────────────────
const deleteAdmission = async (req, res) => {
  try {
    const role = req.user.role;
    if (!["admin", "super-admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Only admin can delete admissions" });
    }

    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });

    res.status(200).json({ success: true, message: "Admission deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Search by Mobile ─────────────────────────────────────────────────────────
const getAdmissionByMobile = async (req, res) => {
  try {
    const admission = await Admission.findOne({ mobile: req.params.mobile });
    if (!admission) return res.status(404).json({ success: false, message: "No user found" });
    res.status(200).json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createAdmission, getAdmissions, updateAdmission, deleteAdmission, getAdmissionByMobile };
