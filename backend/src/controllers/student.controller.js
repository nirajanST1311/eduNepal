const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const StudentNote = require("../models/StudentNote");
const Topic = require("../models/Topic");
const Chapter = require("../models/Chapter");

exports.getAll = async (req, res) => {
  const filter = { role: "STUDENT", active: true };
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.query.classId) filter.classId = req.query.classId;
  const students = await User.find(filter)
    .select("name email rollNumber classId avatar phone")
    .populate("classId", "grade section");
  res.json(students);
};

exports.getOverview = async (req, res) => {
  const student = await User.findById(req.params.id)
    .select("-password")
    .populate("classId", "grade section")
    .populate("schoolId", "name");
  if (!student) return res.status(404).json({ message: "Student not found" });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [attRecords, assignments, submissions, notes] = await Promise.all([
    Attendance.find({
      classId: student.classId,
      "records.studentId": student._id,
      date: { $gte: monthStart, $lte: monthEnd },
    }),
    Assignment.find({ classId: student.classId, status: "published" }).populate(
      "subjectId",
      "name",
    ),
    Submission.find({ studentId: student._id }),
    StudentNote.find({ studentId: student._id })
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const attFlat = attRecords.map((a) => {
    const rec = a.records.find(
      (r) => r.studentId.toString() === student._id.toString(),
    );
    return { date: a.date, status: rec?.status };
  });
  const present = attFlat.filter((r) => r.status === "P").length;
  const absent = attFlat.filter((r) => r.status === "A").length;
  const attTotal = present + absent;

  const subMap = {};
  submissions.forEach((s) => (subMap[s.assignmentId.toString()] = s));
  const assignmentData = assignments.map((a) => {
    const sub = subMap[a._id.toString()];
    return {
      _id: a._id,
      title: a.title,
      subject: a.subjectId?.name,
      dueDate: a.dueDate,
      maxMarks: a.maxMarks,
      submission: sub
        ? {
            status: sub.status,
            marks: sub.marks,
            late: sub.late,
            submittedAt: sub.submittedAt,
          }
        : null,
    };
  });

  const avgScore = submissions.filter((s) => s.marks != null).length
    ? Math.round(
        submissions
          .filter((s) => s.marks != null)
          .reduce((sum, s) => sum + s.marks, 0) /
          submissions.filter((s) => s.marks != null).length,
      )
    : 0;

  res.json({
    student,
    attendance: {
      present,
      absent,
      total: attTotal,
      percentage: attTotal ? Math.round((present / attTotal) * 100) : 0,
      records: attFlat,
    },
    assignments: assignmentData,
    doneCount: submissions.length,
    totalAssignments: assignments.length,
    avgScore,
    notes,
  });
};

exports.addNote = async (req, res) => {
  const note = await StudentNote.create({
    studentId: req.params.id,
    teacherId: req.user._id,
    content: req.body.content,
  });
  res.status(201).json(note);
};
