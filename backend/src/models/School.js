const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    municipalityId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: String,
    principalId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("School", schoolSchema);
