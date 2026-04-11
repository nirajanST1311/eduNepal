const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  const chapters = await Chapter.find(filter).sort({ order: 1 });

  // Batch-fetch all topics in one query instead of N+1
  const chapterIds = chapters.map((ch) => ch._id);
  const allTopics = await Topic.find({ chapterId: { $in: chapterIds } }).sort({
    order: 1,
  });

  const topicsByChapter = {};
  for (const t of allTopics) {
    const key = t.chapterId.toString();
    if (!topicsByChapter[key]) topicsByChapter[key] = [];
    topicsByChapter[key].push(t);
  }

  const result = chapters.map((ch) => {
    const topics = topicsByChapter[ch._id.toString()] || [];
    const types = [...new Set(topics.map((t) => t.type))];
    return {
      ...ch.toObject(),
      topics: topics.map((t) => ({
        _id: t._id,
        title: t.title,
        type: t.type,
      })),
      topicCount: topics.length,
      contentTypes: types,
    };
  });

  res.json(result);
};

exports.getById = async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) return res.status(404).json({ message: "Chapter not found" });
  const topics = await Topic.find({ chapterId: chapter._id }).sort({
    order: 1,
  });
  res.json({ ...chapter.toObject(), topics });
};

exports.create = async (req, res) => {
  const chapter = await Chapter.create({
    ...req.body,
    schoolId: req.user.schoolId,
  });
  res.status(201).json(chapter);
};

exports.update = async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!chapter) return res.status(404).json({ message: "Chapter not found" });
  res.json(chapter);
};

exports.remove = async (req, res) => {
  await Topic.deleteMany({ chapterId: req.params.id });
  await Chapter.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
