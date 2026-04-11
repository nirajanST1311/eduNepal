const Notice = require("../models/Notice");

exports.getAll = async (req, res) => {
  const filter = {};

  // Role-based visibility
  if (["STUDENT", "TEACHER", "SCHOOL_ADMIN"].includes(req.user.role)) {
    filter.$or = [{ schoolId: req.user.schoolId }, { from: "municipality" }];
  }

  // Scope filter — "global" means anything that is NOT class-specific
  // (handles legacy notices that have no scope field)
  if (req.query.scope === "global") {
    filter.scope = { $ne: "class" };
  } else if (req.query.scope === "class") {
    filter.scope = "class";
    // Teachers only see class notices for their own classes
    if (req.user.role === "TEACHER" && req.user.classIds?.length) {
      filter.classId = { $in: req.user.classIds };
    }
  }

  if (req.query.classId) filter.classId = req.query.classId;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.from) filter.from = req.query.from;

  // Search
  if (req.query.search) {
    const re = new RegExp(
      req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    const searchCond = [{ title: re }, { body: re }];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchCond }];
      delete filter.$or;
    } else {
      filter.$or = searchCond;
    }
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .populate("authorId", "name role")
      .populate("classId", "grade section")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notice.countDocuments(filter),
  ]);

  res.json({ notices, total, page, totalPages: Math.ceil(total / limit) });
};

exports.create = async (req, res) => {
  const {
    title,
    body,
    category,
    targetAudience,
    schoolId,
    priority,
    scope,
    classId,
  } = req.body;

  // Teachers may only create class-specific notices
  if (req.user.role === "TEACHER" && scope !== "class") {
    return res
      .status(403)
      .json({ message: "Teachers can only create class-specific notices" });
  }

  const notice = await Notice.create({
    title,
    body,
    category,
    targetAudience,
    priority: priority || "medium",
    scope: scope || "global",
    classId: scope === "class" ? classId : undefined,
    authorId: req.user._id,
    schoolId: req.user.schoolId || schoolId || undefined,
    from: req.user.role === "SUPER_ADMIN" ? "municipality" : "school",
  });
  const populated = await notice.populate("authorId", "name role");
  await notice.populate("classId", "grade section");
  res.status(201).json(populated);
};

exports.update = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ message: "Not found" });
  if (
    req.user.role === "TEACHER" &&
    String(notice.authorId) !== String(req.user._id)
  ) {
    return res.status(403).json({ message: "Not allowed" });
  }
  const { title, body, category, priority } = req.body;
  if (title !== undefined) notice.title = title;
  if (body !== undefined) notice.body = body;
  if (category !== undefined) notice.category = category;
  if (priority !== undefined) notice.priority = priority;
  await notice.save();
  await notice.populate("authorId", "name role");
  await notice.populate("classId", "grade section");
  res.json(notice);
};

exports.remove = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ message: "Not found" });
  // Teachers can only delete their own notices
  if (
    req.user.role === "TEACHER" &&
    String(notice.authorId) !== String(req.user._id)
  ) {
    return res.status(403).json({ message: "Not allowed" });
  }
  await notice.deleteOne();
  res.json({ message: "Deleted" });
};
