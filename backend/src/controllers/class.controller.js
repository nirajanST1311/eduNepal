const Class = require("../models/Class");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  const classes = await Class.find(filter).sort({ grade: 1, section: 1 });
  res.json(classes);
};

exports.create = async (req, res) => {
  const cls = await Class.create({ ...req.body, schoolId: req.user.schoolId });
  res.status(201).json(cls);
};

exports.update = async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!cls) return res.status(404).json({ message: "Class not found" });
  res.json(cls);
};

exports.remove = async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
