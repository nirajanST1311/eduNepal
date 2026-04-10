const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: String,
    textContent: String,
    submittedAt: { type: Date, default: Date.now },
    marks: Number,
    feedback: String,
    late: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
