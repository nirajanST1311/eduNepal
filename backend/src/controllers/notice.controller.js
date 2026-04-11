const Notice = require("../models/Notice");

exports.getAll = async (req, res) => {
  const must = [];

  // Role-based school visibility
  if (["STUDENT", "TEACHER", "SCHOOL_ADMIN"].includes(req.user.role)) {
    must.push({
      $or: [{ schoolId: req.user.schoolId }, { from: "municipality" }],
    });
  }

  // Scope filter
  if (req.query.scope === "global") {
    must.push({ scope: { $ne: "class" } });
  } else if (req.query.scope === "class") {
    must.push({ scope: "class" });
    // Teachers: restrict to their classes OR their own notices
    if (req.user.role === "TEACHER") {
      if (req.user.classIds?.length) {
        must.push({
          $or: [
            { classId: { $in: req.user.classIds } },
            { classIds: { $in: req.user.classIds } },
            { authorId: req.user._id },
          ],
        });
      } else {
        // No classIds assigned — only see own notices
        must.push({ authorId: req.user._id });
      }
    }
    // Students: restrict to their class
    if (req.user.role === "STUDENT" && req.user.classId) {
      must.push({
        $or: [{ classId: req.user.classId }, { classIds: req.user.classId }],
      });
    }
  }

  // Specific class filter
  if (req.query.classId) {
    must.push({
      $or: [{ classId: req.query.classId }, { classIds: req.query.classId }],
    });
  }

  if (req.query.category) must.push({ category: req.query.category });
  if (req.query.priority) must.push({ priority: req.query.priority });
  if (req.query.from) must.push({ from: req.query.from });

  // Status filter — students never see drafts/inactive
  if (req.query.status) {
    must.push({ status: req.query.status });
  } else if (req.user.role === "STUDENT") {
    must.push({ status: { $nin: ["draft", "inactive"] } });
  }

  // Search
  if (req.query.search) {
    const re = new RegExp(
      req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    must.push({ $or: [{ title: re }, { body: re }] });
  }

  const filter = must.length > 0 ? { $and: must } : {};
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .populate("authorId", "name role")
      .populate("classId", "grade section")
      .populate("classIds", "grade section")
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
    classIds,
    status,
  } = req.body;

  // Teachers may only create class-specific notices
  if (req.user.role === "TEACHER" && scope !== "class") {
    return res
      .status(403)
      .json({ message: "Teachers can only create class-specific notices" });
  }

  // Normalise classIds: accept either classId (single) or classIds (array)
  const resolvedClassIds =
    scope === "class"
      ? classIds?.length
        ? classIds
        : classId
          ? [classId]
          : []
      : [];

  const notice = await Notice.create({
    title,
    body,
    category,
    targetAudience,
    priority: priority || "medium",
    scope: scope || "global",
    status: status || "active",
    classId: resolvedClassIds[0] || undefined,
    classIds: resolvedClassIds,
    authorId: req.user._id,
    schoolId: req.user.schoolId || schoolId || undefined,
    from: req.user.role === "SUPER_ADMIN" ? "municipality" : "school",
  });
  await notice.populate("authorId", "name role");
  await notice.populate("classId", "grade section");
  await notice.populate("classIds", "grade section");
  res.status(201).json(notice);
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
  const { title, body, category, priority, classId, classIds, status } =
    req.body;
  if (title !== undefined) notice.title = title;
  if (body !== undefined) notice.body = body;
  if (category !== undefined) notice.category = category;
  if (priority !== undefined) notice.priority = priority;
  if (status !== undefined) notice.status = status;
  if (classIds !== undefined) {
    notice.classIds = classIds;
    notice.classId = classIds[0] || undefined;
  } else if (classId !== undefined) {
    notice.classId = classId;
    notice.classIds = classId ? [classId] : [];
  }
  await notice.save();
  await notice.populate("authorId", "name role");
  await notice.populate("classId", "grade section");
  await notice.populate("classIds", "grade section");
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
