const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.classId) filter.classId = req.query.classId;
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;
  if (req.query.teacherId) filter.teacherId = req.query.teacherId;
  if (req.query.status) filter.status = req.query.status;

  if (req.user.role === "TEACHER") filter.teacherId = req.user._id;
  if (req.user.role === "STUDENT") {
    filter.classId = req.user.classId;
    filter.status = "published";
  }

  const assignments = await Assignment.find(filter)
    .populate("subjectId", "name")
    .populate("classId", "grade section")
    .populate("teacherId", "name")
    .sort({ dueDate: -1 });

  if (req.user.role === "STUDENT") {
    const withStatus = await Promise.all(
      assignments.map(async (a) => {
        const sub = await Submission.findOne({
          assignmentId: a._id,
          studentId: req.user._id,
        });
        return { ...a.toObject(), submission: sub };
      }),
    );
    return res.json(withStatus);
  }

  const withCounts = await Promise.all(
    assignments.map(async (a) => {
      const [total, graded] = await Promise.all([
        Submission.countDocuments({ assignmentId: a._id }),
        Submission.countDocuments({ assignmentId: a._id, status: "graded" }),
      ]);
      return { ...a.toObject(), submissionCount: total, gradedCount: graded };
    }),
  );

  res.json(withCounts);
};

exports.getById = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("subjectId", "name")
    .populate("classId", "grade section");
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found" });
  res.json(assignment);
};

exports.create = async (req, res) => {
  const assignment = await Assignment.create({
    ...req.body,
    teacherId: req.user._id,
    schoolId: req.user.schoolId,
  });
  res.status(201).json(assignment);
};

exports.update = async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found" });
  res.json(assignment);
};

exports.getSubmissions = async (req, res) => {
  const submissions = await Submission.find({ assignmentId: req.params.id })
    .populate("studentId", "name rollNumber avatar")
    .sort({ submittedAt: 1 });
  res.json(submissions);
};

exports.submit = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found" });

  const late = new Date() > assignment.dueDate;
  if (late && !assignment.allowLate) {
    return res.status(400).json({ message: "Late submissions not allowed" });
  }

  const existing = await Submission.findOne({
    assignmentId: req.params.id,
    studentId: req.user._id,
  });
  if (existing) return res.status(400).json({ message: "Already submitted" });

  const submission = await Submission.create({
    assignmentId: req.params.id,
    studentId: req.user._id,
    textContent: req.body.textContent,
    fileUrl: req.body.fileUrl,
    late,
  });
  res.status(201).json(submission);
};

exports.grade = async (req, res) => {
  const { marks, feedback } = req.body;
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { marks, feedback, status: "graded" },
    { new: true },
  );
  if (!submission)
    return res.status(404).json({ message: "Submission not found" });
  res.json(submission);
};

exports.deleteAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment)
    return res.status(404).json({ message: "Assignment not found" });
  if (String(assignment.teacherId) !== String(req.user._id))
    return res.status(403).json({ message: "Not authorized" });
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
