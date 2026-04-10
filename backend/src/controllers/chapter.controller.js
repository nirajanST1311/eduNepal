const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  const chapters = await Chapter.find(filter).sort({ order: 1 });

  const chaptersWithTopics = await Promise.all(
    chapters.map(async (ch) => {
      const topics = await Topic.find({ chapterId: ch._id }).sort({ order: 1 });
      const types = [...new Set(topics.map((t) => t.type))];
      return {
        ...ch.toObject(),
        topicCount: topics.length,
        contentTypes: types,
      };
    }),
  );

  res.json(chaptersWithTopics);
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
