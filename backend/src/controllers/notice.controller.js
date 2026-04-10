const Notice = require("../models/Notice");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.user.role === "STUDENT" || req.user.role === "TEACHER") {
    filter.$or = [{ schoolId: req.user.schoolId }, { from: "municipality" }];
  }
  const notices = await Notice.find(filter)
    .populate("authorId", "name role")
    .sort({ createdAt: -1 });
  res.json(notices);
};

exports.create = async (req, res) => {
  const { title, body, category, targetAudience, schoolId, priority } =
    req.body;
  const notice = await Notice.create({
    title,
    body,
    category,
    targetAudience,
    priority,
    authorId: req.user._id,
    schoolId: req.user.schoolId || schoolId || undefined,
    from: req.user.role === "SUPER_ADMIN" ? "municipality" : "school",
  });
  const populated = await notice.populate("authorId", "name role");
  res.status(201).json(populated);
};

exports.remove = async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
