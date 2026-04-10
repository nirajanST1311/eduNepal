const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Chapter = require("../models/Chapter");
const Notice = require("../models/Notice");

exports.getStats = async (req, res) => {
  const schoolId = req.user.schoolId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalTeachers,
    classes,
    subjects,
    todayAttendance,
    pendingSubmissions,
    chapters,
    recentNotices,
    assignments,
  ] = await Promise.all([
    User.countDocuments({ schoolId, role: "STUDENT", active: true }),
    User.countDocuments({ schoolId, role: "TEACHER", active: true }),
    Class.find({ schoolId }),
    Subject.find({ schoolId }).populate("teacherId", "name email"),
    Attendance.find({ schoolId, date: today }),
    Submission.countDocuments({ status: "submitted" }),
    Chapter.find({ schoolId }),
    Notice.find({ $or: [{ schoolId }, { schoolId: null }] })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("authorId", "name"),
    Assignment.find({ schoolId, status: "published" }),
  ]);

  // Attendance today by class
  const attendanceByClass = [];
  for (const cls of classes) {
    const record = todayAttendance.find(
      (a) => a.classId.toString() === cls._id.toString(),
    );
    const studentsInClass = await User.countDocuments({
      schoolId,
      classId: cls._id,
      role: "STUDENT",
      active: true,
    });
    let present = 0;
    let absent = 0;
    if (record) {
      present = record.records.filter((r) => r.status === "P").length;
      absent = record.records.filter((r) => r.status === "A").length;
    }
    attendanceByClass.push({
      classId: cls._id,
      grade: cls.grade,
      section: cls.section,
      totalStudents: studentsInClass,
      present,
      absent,
      percentage: studentsInClass
        ? Math.round((present / studentsInClass) * 100)
        : 0,
      marked: !!record,
    });
  }

  // Overall attendance percentage (today)
  const totalPresent = attendanceByClass.reduce((s, c) => s + c.present, 0);
  const totalMarked = attendanceByClass.reduce(
    (s, c) => s + c.present + c.absent,
    0,
  );
  const overallAttendance = totalMarked
    ? Math.round((totalPresent / totalMarked) * 100)
    : 0;

  // Teacher activity: subjects per teacher, content progress
  const teacherMap = {};
  subjects.forEach((s) => {
    if (!s.teacherId) return;
    const tid = s.teacherId._id.toString();
    if (!teacherMap[tid]) {
      teacherMap[tid] = {
        _id: s.teacherId._id,
        name: s.teacherId.name,
        email: s.teacherId.email,
        subjects: [],
        classIds: new Set(),
      };
    }
    teacherMap[tid].subjects.push(s.name);
    teacherMap[tid].classIds.add(s.classId.toString());
  });

  const teacherActivity = Object.values(teacherMap).map((t) => {
    const teacherChapters = chapters.filter((c) =>
      subjects.some(
        (s) =>
          s.teacherId &&
          s.teacherId._id.toString() === t._id.toString() &&
          s._id.toString() === c.subjectId.toString(),
      ),
    );
    const published = teacherChapters.filter(
      (c) => c.status === "published",
    ).length;
    const total = teacherChapters.length;
    return {
      _id: t._id,
      name: t.name,
      email: t.email,
      subjects: [...new Set(t.subjects)],
      classCount: t.classIds.size,
      contentProgress: total ? Math.round((published / total) * 100) : 0,
      totalChapters: total,
      publishedChapters: published,
    };
  });

  // Content progress overall
  const totalChapters = chapters.length;
  const publishedChapters = chapters.filter(
    (c) => c.status === "published",
  ).length;

  // Alerts
  const alerts = [];
  attendanceByClass.forEach((c) => {
    if (!c.marked) {
      alerts.push({
        type: "attendance",
        message: `Class ${c.grade}${c.section} attendance not marked today`,
        severity: "warning",
      });
    }
    if (c.marked && c.percentage < 70) {
      alerts.push({
        type: "attendance",
        message: `Class ${c.grade}${c.section} has low attendance (${c.percentage}%)`,
        severity: "error",
      });
    }
  });
  if (pendingSubmissions > 0) {
    alerts.push({
      type: "assignment",
      message: `${pendingSubmissions} assignment submissions pending review`,
      severity: "info",
    });
  }

  res.json({
    totalStudents,
    totalTeachers,
    overallAttendance,
    pendingSubmissions,
    attendanceByClass,
    teacherActivity,
    contentProgress: {
      total: totalChapters,
      published: publishedChapters,
      percentage: totalChapters
        ? Math.round((publishedChapters / totalChapters) * 100)
        : 0,
    },
    alerts,
    recentNotices,
    totalClasses: classes.length,
    totalAssignments: assignments.length,
  });
};

exports.getSuperadminStats = async (req, res) => {
  const School = require("../models/School");

  const [schools, totalStudents, totalTeachers, totalPrincipals] =
    await Promise.all([
      School.find().populate("principalId", "name email phone"),
      User.countDocuments({ role: "STUDENT", active: true }),
      User.countDocuments({ role: "TEACHER", active: true }),
      User.countDocuments({ role: "SCHOOL_ADMIN", active: true }),
    ]);

  // Per-school summary
  const schoolSummaries = await Promise.all(
    schools.map(async (s) => {
      const [students, teachers] = await Promise.all([
        User.countDocuments({ schoolId: s._id, role: "STUDENT", active: true }),
        User.countDocuments({ schoolId: s._id, role: "TEACHER", active: true }),
      ]);
      return {
        _id: s._id,
        name: s.name,
        principal: s.principalId
          ? { name: s.principalId.name, email: s.principalId.email }
          : null,
        students,
        teachers,
        active: s.active,
        district: s.district,
        municipality: s.municipality,
      };
    }),
  );

  res.json({
    totalSchools: schools.length,
    totalStudents,
    totalTeachers,
    totalPrincipals,
    schools: schoolSummaries,
  });
};
