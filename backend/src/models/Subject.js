const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    icon: String,
    color: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Subject", subjectSchema);
