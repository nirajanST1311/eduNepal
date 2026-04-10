const School = require("../models/School");
const User = require("../models/User");

exports.getAll = async (req, res) => {
  const schools = await School.find().populate("principalId", "name email");
  res.json(schools);
};

exports.getById = async (req, res) => {
  const school = await School.findById(req.params.id).populate(
    "principalId",
    "name email",
  );
  if (!school) return res.status(404).json({ message: "School not found" });
  res.json(school);
};

exports.create = async (req, res) => {
  const { principal, ...schoolData } = req.body;

  // Create school first
  const school = await School.create({
    ...schoolData,
    municipalityId: req.user._id,
  });

  // Create principal user if provided
  if (principal && principal.phone) {
    const existing = await User.findOne({ phone: principal.phone });
    if (existing) {
      await School.findByIdAndDelete(school._id);
      return res
        .status(400)
        .json({ message: "A user with that phone number already exists" });
    }

    const principalUser = await User.create({
      name: principal.name,
      email: principal.email || `principal_${school._id}@school.edu.np`,
      password: principal.password || "changeme123",
      role: "SCHOOL_ADMIN",
      schoolId: school._id,
      phone: principal.phone,
    });
    school.principalId = principalUser._id;
    await school.save();
  }

  const populated = await School.findById(school._id).populate(
    "principalId",
    "name email phone",
  );
  res.status(201).json(populated);
};

exports.update = async (req, res) => {
  const school = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!school) return res.status(404).json({ message: "School not found" });
  res.json(school);
};

exports.getStats = async (req, res) => {
  const schoolId = req.params.id;
  const [teachers, students] = await Promise.all([
    User.countDocuments({ schoolId, role: "TEACHER", active: true }),
    User.countDocuments({ schoolId, role: "STUDENT", active: true }),
  ]);
  res.json({ teachers, students });
};
