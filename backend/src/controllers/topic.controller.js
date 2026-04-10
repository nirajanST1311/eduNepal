const Topic = require("../models/Topic");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.chapterId) filter.chapterId = req.query.chapterId;
  const topics = await Topic.find(filter).sort({ order: 1 });
  res.json(topics);
};

exports.create = async (req, res) => {
  const topic = await Topic.create(req.body);
  res.status(201).json(topic);
};

exports.update = async (req, res) => {
  const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!topic) return res.status(404).json({ message: "Topic not found" });
  res.json(topic);
};

exports.remove = async (req, res) => {
  await Topic.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
