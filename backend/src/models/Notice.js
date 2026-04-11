const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    from: { type: String, enum: ["school", "municipality"], default: "school" },
    category: {
      type: String,
      enum: ["general", "urgent", "holiday", "exam_schedule", "event"],
      default: "general",
    },
    targetAudience: { type: String, default: "All" },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    scope: {
      type: String,
      enum: ["global", "class"],
      default: "global",
    },
    status: {
      type: String,
      enum: ["active", "draft", "inactive"],
      default: "active",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notice", noticeSchema);
