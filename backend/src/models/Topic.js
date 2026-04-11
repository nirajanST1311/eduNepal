const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["note", "video", "pdf", "audio"],
      required: true,
    },
    content: String,
    fileUrl: String,
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "published", "inactive"],
      default: "published",
    },
  },
  { timestamps: true },
);

topicSchema.index({ chapterId: 1, order: 1 });

module.exports = mongoose.model("Topic", topicSchema);
