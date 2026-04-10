const Notice = require("../models/Notice");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.from) filter.from = req.query.from;
  if (
    req.user.role === "STUDENT" ||
    req.user.role === "TEACHER" ||
    req.user.role === "SCHOOL_ADMIN"
  ) {
    filter.$or = [{ schoolId: req.user.schoolId }, { from: "municipality" }];
  }
  if (req.query.search) {
    const re = new RegExp(
      req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    filter.$or = filter.$or
      ? [
          {
            $and: [{ $or: filter.$or }, { $or: [{ title: re }, { body: re }] }],
          },
        ]
      : [{ title: re }, { body: re }];
    if (filter.$or && filter.$or[0]?.$and) {
      // Flatten the nested $or/$and for proper MongoDB query
      const roleFilter = filter.$or[0].$and[0].$or;
      const searchFilter = filter.$or[0].$and[1].$or;
      delete filter.$or;
      filter.$and = [{ $or: roleFilter }, { $or: searchFilter }];
    }
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .populate("authorId", "name role")
      .populate("schoolId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notice.countDocuments(filter),
  ]);

  res.json({
    notices,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
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
