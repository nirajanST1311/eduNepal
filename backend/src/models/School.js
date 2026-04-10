const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    municipalityId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    principalId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },

    // Identity
    name: { type: String, required: true, trim: true },
    nameNp: { type: String, trim: true },
    regNo: { type: String, trim: true },
    emis: { type: String, trim: true },
    established: { type: String, trim: true },
    phone: String,
    email: { type: String, trim: true, lowercase: true },
    schoolLevel: {
      type: String,
      enum: ["Secondary (1-12)", "Basic (1-8)"],
      default: "Secondary (1-12)",
    },
    managementType: {
      type: String,
      enum: ["Community", "Institutional"],
      default: "Community",
    },
    affiliationBoard: { type: String, trim: true },
    sanctionedPositions: String,

    // Location
    province: String,
    district: String,
    municipality: String,
    ward: String,
    tole: String,
    addressNp: String,
    gpsLat: String,
    gpsLng: String,

    // Academic
    academicYear: String,
    totalStudents: String,
    grades: [Number],
    sections: {
      primary: { type: String, default: "1 section" },
      middle: { type: String, default: "1 section" },
      secondary: { type: String, default: "1 section" },
    },
    subjects: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("School", schoolSchema);
