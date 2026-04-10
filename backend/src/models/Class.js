const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    grade: { type: Number, required: true },
    section: { type: String, default: "A", trim: true },
    academicYear: { type: String, required: true },
  },
  { timestamps: true },
);

classSchema.index(
  { schoolId: 1, grade: 1, section: 1, academicYear: 1 },
  { unique: true },
);

module.exports = mongoose.model("Class", classSchema);
