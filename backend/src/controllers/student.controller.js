const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const StudentNote = require("../models/StudentNote");

exports.getAll = async (req, res) => {
  const filter = { role: "STUDENT", active: true };
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.query.classId) filter.classId = req.query.classId;
  const students = await User.find(filter)
    .select("name email rollNumber classId avatar phone createdAt")
    .populate("classId", "grade section");

  if (!req.query.classId) return res.json(students);

  // Compute attendance % for each student in this class
  const attRecords = await Attendance.find({
    classId: req.query.classId,
    "records.studentId": { $in: students.map((s) => s._id) },
  });

  const statsMap = {};
  for (const s of students) {
    statsMap[s._id.toString()] = { present: 0, total: 0 };
  }
  for (const att of attRecords) {
    for (const rec of att.records) {
      const sid = rec.studentId.toString();
      if (statsMap[sid]) {
        statsMap[sid].total++;
        if (rec.status === "P") statsMap[sid].present++;
      }
    }
  }

  const enriched = students.map((s) => {
    const obj = s.toObject();
    const st = statsMap[s._id.toString()];
    obj.attendancePercent =
      st && st.total > 0 ? Math.round((st.present / st.total) * 100) : null;
    obj.totalPresent = st?.present || 0;
    obj.totalDays = st?.total || 0;
    return obj;
  });

  res.json(enriched);
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

  // Build monthlyAttendance calendar (for the attendance grid in detail page)
  const daysInMonth = monthEnd.getDate();
  const firstDow = new Date(now.getFullYear(), now.getMonth(), 1).getDay(); // 0=Sun
  const attByDate = {};
  attFlat.forEach((r) => {
    const d = new Date(r.date).getDate();
    attByDate[d] = r.status;
  });
  // Pad beginning for alignment (Mon-based: Mon=0)
  const padStart = firstDow === 0 ? 6 : firstDow - 1;
  const days = Array(padStart).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(attByDate[d] || null);
  }

  const studentObj = student.toObject();
  studentObj.grade = student.classId?.grade || "";
  studentObj.section = student.classId?.section || "";
  studentObj.schoolName = student.schoolId?.name || "";
  studentObj.enrolledAt = student.createdAt;

  res.json({
    student: studentObj,
    attendance: {
      present,
      absent,
      total: attTotal,
      percentage: attTotal ? Math.round((present / attTotal) * 100) : 0,
      records: attFlat,
    },
    monthlyAttendance: {
      days,
      absentDays: absent,
    },
    assignments: assignmentData,
    doneCount: submissions.length,
    totalAssignments: assignments.length,
    avgScore,
    notes,
  });
};

exports.addNote = async (req, res) => {
  const content = req.body.content || req.body.text;
  if (!content?.trim()) {
    return res.status(400).json({ message: "Note content is required" });
  }
  const note = await StudentNote.create({
    studentId: req.params.id,
    teacherId: req.user._id,
    content: content.trim(),
  });
  res.status(201).json(note);
};
