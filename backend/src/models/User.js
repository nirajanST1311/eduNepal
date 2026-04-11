const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    municipalityId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT"],
      required: true,
    },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    section: String,
    rollNumber: String,
    subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    phone: String,
    address: String,
    avatar: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
