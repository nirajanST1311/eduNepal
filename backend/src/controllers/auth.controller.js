const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email, active: true }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id);
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      classId: user.classId,
      classIds: user.classIds,
      subjectIds: user.subjectIds,
    },
  });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user._id).populate("schoolId", "name");
  res.json({ user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: "Current password incorrect" });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed" });
};

exports.updateProfile = async (req, res) => {
  const { phone, address } = req.body;
  const update = {};
  if (phone !== undefined) update.phone = phone;
  if (address !== undefined) update.address = address;
  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
  });
  res.json({ user });
};
