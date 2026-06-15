const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["online", "cash", "pending"],
    default: "pending",
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return this.mode === "online";
    },
    set: (v) => (v && v.trim() !== "" ? v : undefined),
  },
});

const admissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, required: true },
    isAdmitted: { type: Boolean, default: true },
    payment: {
      firstInstallment: { type: installmentSchema, required: true },
      secondInstallment: {
        type: installmentSchema,
        default: () => ({ mode: "pending" }),
      },
    },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
