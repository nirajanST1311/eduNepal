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
  const school = await School.create({
    ...req.body,
    municipalityId: req.user._id,
  });
  res.status(201).json(school);
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
