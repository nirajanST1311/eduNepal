const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
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
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: String,
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    allowLate: { type: Boolean, default: false },
    fileUrl: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
