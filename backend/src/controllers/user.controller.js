const User = require("../models/User");
const Subject = require("../models/Subject");

exports.getAll = async (req, res) => {
  const filter = { active: true };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.query.classId) filter.classId = req.query.classId;

  // SCHOOL_ADMIN can only see users in their own school
  if (req.user.role === "SCHOOL_ADMIN") {
    filter.schoolId = req.user.schoolId;
  }

  const users = await User.find(filter)
    .select("-password")
    .populate("schoolId", "name")
    .populate("classId", "grade section")
    .populate("classIds", "grade section")
    .populate("subjectIds", "name");
  res.json(users);
};

exports.getById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("schoolId", "name")
    .populate("classId", "grade section")
    .populate("classIds", "grade section")
    .populate("subjectIds", "name");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

exports.create = async (req, res) => {
  const { email, role } = req.body;

  // Validate role-based creation permissions
  if (req.user.role === "TEACHER") {
    if (role !== "STUDENT") {
      return res
        .status(403)
        .json({ message: "Teachers can only create students" });
    }
    req.body.schoolId = req.user.schoolId;
  }
  if (req.user.role === "SCHOOL_ADMIN") {
    if (!["TEACHER", "STUDENT"].includes(role)) {
      return res
        .status(403)
        .json({ message: "You can only create teachers and students" });
    }
    req.body.schoolId = req.user.schoolId;
  }
  if (req.user.role === "SUPER_ADMIN") {
    if (!["SCHOOL_ADMIN", "TEACHER", "STUDENT"].includes(role)) {
      return res.status(403).json({ message: "Invalid role" });
    }
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(400)
      .json({ message: "A user with this email already exists" });
  }

  const user = await User.create(req.body);

  // Sync Subject.teacherId for teacher assignments
  if (role === "TEACHER" && req.body.subjectIds?.length) {
    await Subject.updateMany(
      { _id: { $in: req.body.subjectIds } },
      { teacherId: user._id },
    );
  }

  const populated = await User.findById(user._id)
    .select("-password")
    .populate("schoolId", "name")
    .populate("classId", "grade section")
    .populate("classIds", "grade section")
    .populate("subjectIds", "name");
  res.status(201).json(populated);
};

exports.update = async (req, res) => {
  // Don't allow password update through this endpoint
  delete req.body.password;

  // SCHOOL_ADMIN can only update users in their school
  if (req.user.role === "SCHOOL_ADMIN") {
    const target = await User.findById(req.params.id);
    if (
      !target ||
      target.schoolId?.toString() !== req.user.schoolId?.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
    .select("-password")
    .populate("schoolId", "name")
    .populate("classId", "grade section")
    .populate("classIds", "grade section")
    .populate("subjectIds", "name");
  if (!user) return res.status(404).json({ message: "User not found" });

  // Sync Subject.teacherId for teacher assignments
  if (user.role === "TEACHER" && req.body.subjectIds) {
    // Remove this teacher from subjects no longer assigned
    await Subject.updateMany(
      { teacherId: user._id, _id: { $nin: req.body.subjectIds } },
      { $unset: { teacherId: "" } },
    );
    // Set this teacher on newly assigned subjects
    if (req.body.subjectIds.length) {
      await Subject.updateMany(
        { _id: { $in: req.body.subjectIds } },
        { teacherId: user._id },
      );
    }
  }

  res.json(user);
};

exports.deactivate = async (req, res) => {
  // SCHOOL_ADMIN can only deactivate users in their school
  if (req.user.role === "SCHOOL_ADMIN") {
    const target = await User.findById(req.params.id);
    if (
      !target ||
      target.schoolId?.toString() !== req.user.schoolId?.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true },
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deactivated" });
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const user = await User.findById(req.params.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password reset successfully" });
};
