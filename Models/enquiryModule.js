const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    mobile: { type: String, required: true },
    registrationFees: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    Enquiry_Message: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("enquirydata", enquirySchema);
