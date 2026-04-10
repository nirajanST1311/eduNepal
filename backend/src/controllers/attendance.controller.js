const Attendance = require("../models/Attendance");
const User = require("../models/User");

exports.mark = async (req, res) => {
  const { classId, date, records } = req.body;
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({ classId, date: dateObj });
  if (existing) {
    existing.records = records;
    await existing.save();
    return res.json(existing);
  }

  const attendance = await Attendance.create({
    schoolId: req.user.schoolId,
    classId,
    teacherId: req.user._id,
    date: dateObj,
    records,
  });
  res.status(201).json(attendance);
};

exports.getByClass = async (req, res) => {
  const filter = { classId: req.query.classId };
  if (req.query.date) {
    const d = new Date(req.query.date);
    d.setHours(0, 0, 0, 0);
    filter.date = d;
  }
  if (req.query.from && req.query.to) {
    filter.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to),
    };
  }
  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json(records);
};

exports.getStudentAttendance = async (req, res) => {
  const studentId = req.params.studentId || req.user._id;
  const student = await User.findById(studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const filter = { classId: student.classId, "records.studentId": studentId };
  if (req.query.from && req.query.to) {
    filter.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to),
    };
  }

  const attendances = await Attendance.find(filter).sort({ date: 1 });
  const result = attendances.map((a) => {
    const rec = a.records.find(
      (r) => r.studentId.toString() === studentId.toString(),
    );
    return { date: a.date, status: rec?.status };
  });

  const present = result.filter((r) => r.status === "P").length;
  const absent = result.filter((r) => r.status === "A").length;
  const total = present + absent;

  res.json({
    records: result,
    present,
    absent,
    total,
    percentage: total ? Math.round((present / total) * 100) : 0,
  });
};
