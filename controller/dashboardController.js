const Admission = require("../Models/admissionModule");
const Enquiry = require("../Models/enquiryModule");
const Registration = require("../Models/registrationModule");

const MODEL_MAP = {
  admission: Admission,
  enquiry: Enquiry,
  registration: Registration,
};

// ─── User: own data ───────────────────────────────────────────────────────────
const getUserData = async (req, res) => {
  try {
    const userName = req.user.name || req.user.role;
    const [admissions, enquiries, registrations] = await Promise.all([
      Admission.find({ createdBy: userName }).sort({ createdAt: -1 }),
      Enquiry.find({ createdBy: userName }).sort({ createdAt: -1 }),
      Registration.find({ createdBy: userName }).sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ success: true, data: { admissions, enquiries, registrations } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── HR: all data (read-only) ─────────────────────────────────────────────────
const getHRData = async (req, res) => {
  try {
    const [admissions, enquiries, registrations] = await Promise.all([
      Admission.find().sort({ createdAt: -1 }),
      Enquiry.find().sort({ createdAt: -1 }),
      Registration.find().sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ success: true, data: { admissions, enquiries, registrations } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin/Super-admin: all data ──────────────────────────────────────────────
const getAllData = async (req, res) => {
  try {
    const [admissions, enquiries, registrations] = await Promise.all([
      Admission.find().sort({ createdAt: -1 }),
      Enquiry.find().sort({ createdAt: -1 }),
      Registration.find().sort({ createdAt: -1 }),
    ]);
    const totalCount = admissions.length + enquiries.length + registrations.length;
    res.status(200).json({ success: true, totalCount, data: { admissions, enquiries, registrations } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Notification: every 50 admissions ───────────────────────────────────────
const checkNotification = async (req, res) => {
  try {
    const count = await Admission.countDocuments();
    const notify = count > 0 && count % 50 === 0;
    res.status(200).json({
      success: true,
      count,
      notify,
      message: notify ? `🎉 Milestone reached: ${count} admissions!` : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Dynamic Update ───────────────────────────────────────────────────────────
const updateData = async (req, res) => {
  try {
    const { module, id } = req.params;
    const Model = MODEL_MAP[module];
    if (!Model) return res.status(400).json({ success: false, message: "Invalid module" });

    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Record not found" });

    Object.assign(doc, { ...req.body, updatedBy: req.user.name || req.user.role });
    const updated = await doc.save();

    res.status(200).json({ success: true, message: "Updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Dynamic Delete ───────────────────────────────────────────────────────────
const deleteData = async (req, res) => {
  try {
    const { module, id } = req.params;
    const Model = MODEL_MAP[module];
    if (!Model) return res.status(400).json({ success: false, message: "Invalid module" });

    if (!["admin", "super-admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only admin can delete records" });
    }

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Record not found" });

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUserData, getHRData, getAllData, checkNotification, updateData, deleteData };
