const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
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
    title: { type: String, required: true, trim: true },
    description: String,
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "published", "not_started", "inactive"],
      default: "not_started",
    },
    scheduledAt: Date,
  },
  { timestamps: true },
);

chapterSchema.index({ subjectId: 1, order: 1 });

module.exports = mongoose.model("Chapter", chapterSchema);
