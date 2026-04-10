const Subject = require("../models/Subject");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.classId) filter.classId = req.query.classId;
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.query.teacherId) filter.teacherId = req.query.teacherId;
  const subjects = await Subject.find(filter)
    .populate("teacherId", "name")
    .populate("classId", "grade section");
  res.json(subjects);
};

exports.create = async (req, res) => {
  const subject = await Subject.create({
    ...req.body,
    schoolId: req.user.schoolId,
  });
  res.status(201).json(subject);
};

exports.update = async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  res.json(subject);
};

exports.remove = async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
