const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    registrationFees: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      required: true,
    },
    transactionId: { type: String, sparse: true },
    examDate: { type: Date, required: true },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

registrationSchema.pre("save", function (next) {
  if (this.paymentMethod === "cash") this.transactionId = undefined;
  next();
});

module.exports = mongoose.model("registrationdata", registrationSchema);
