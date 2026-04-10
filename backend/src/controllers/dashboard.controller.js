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

exports.getSuperadminAnalytics = async (req, res) => {
  const School = require("../models/School");

  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Build school filter
  const schoolFilter = {};
  if (search) {
    schoolFilter.name = { $regex: search, $options: "i" };
  }

  const [totalSchools, schools] = await Promise.all([
    School.countDocuments(schoolFilter),
    School.find(schoolFilter)
      .populate("principalId", "name email phone")
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  // Global counts (unfiltered)
  const [allStudents, allTeachers] = await Promise.all([
    User.countDocuments({ role: "STUDENT", active: true }),
    User.countDocuments({ role: "TEACHER", active: true }),
  ]);

  // Attendance date range: last 30 days
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const schoolIds = schools.map((s) => s._id);

  // Batch-fetch all needed data for these schools
  const [
    studentCounts,
    teacherCounts,
    attendanceAgg,
    chapterAgg,
    assignmentAgg,
    submissionAgg,
  ] = await Promise.all([
    // Students per school
    User.aggregate([
      {
        $match: { schoolId: { $in: schoolIds }, role: "STUDENT", active: true },
      },
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]),
    // Teachers per school
    User.aggregate([
      {
        $match: { schoolId: { $in: schoolIds }, role: "TEACHER", active: true },
      },
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]),
    // Attendance aggregation (last 30 days)
    Attendance.aggregate([
      {
        $match: {
          schoolId: { $in: schoolIds },
          date: { $gte: thirtyDaysAgo, $lte: today },
        },
      },
      { $unwind: "$records" },
      {
        $group: {
          _id: "$schoolId",
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ["$records.status", "P"] }, 1, 0] },
          },
        },
      },
    ]),
    // Chapter content coverage per school
    Chapter.aggregate([
      { $match: { schoolId: { $in: schoolIds } } },
      {
        $group: {
          _id: "$schoolId",
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
        },
      },
    ]),
    // Assignments per school
    Assignment.aggregate([
      { $match: { schoolId: { $in: schoolIds }, status: "published" } },
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]),
    // Submissions (join through assignments)
    Assignment.aggregate([
      { $match: { schoolId: { $in: schoolIds }, status: "published" } },
      {
        $lookup: {
          from: "submissions",
          localField: "_id",
          foreignField: "assignmentId",
          as: "subs",
        },
      },
      { $unwind: { path: "$subs", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$schoolId",
          totalExpected: { $sum: 1 },
          submitted: {
            $sum: { $cond: [{ $ifNull: ["$subs._id", false] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  // Build lookup maps
  const toMap = (arr) => {
    const m = {};
    arr.forEach((r) => (m[r._id.toString()] = r));
    return m;
  };
  const studentMap = toMap(studentCounts);
  const teacherMap = toMap(teacherCounts);
  const attendanceMap = toMap(attendanceAgg);
  const chapterMap = toMap(chapterAgg);
  const assignmentMap = toMap(assignmentAgg);
  const submissionMap = toMap(submissionAgg);

  // Build per-school analytics
  let schoolAnalytics = schools.map((s) => {
    const sid = s._id.toString();
    const students = studentMap[sid]?.count || 0;
    const teachers = teacherMap[sid]?.count || 0;
    const att = attendanceMap[sid];
    const attendance =
      att && att.totalRecords > 0
        ? Math.round((att.presentCount / att.totalRecords) * 100)
        : 0;
    const ch = chapterMap[sid];
    const content =
      ch && ch.total > 0 ? Math.round((ch.published / ch.total) * 100) : 0;
    const assignments = assignmentMap[sid]?.count || 0;
    const sub = submissionMap[sid];
    const submission =
      sub && sub.totalExpected > 0
        ? Math.round((sub.submitted / sub.totalExpected) * 100)
        : 0;

    return {
      _id: s._id,
      name: s.name,
      principal: s.principalId
        ? {
            name: s.principalId.name,
            email: s.principalId.email,
            phone: s.principalId.phone,
          }
        : null,
      students,
      teachers,
      attendance,
      content,
      assignments,
      submission,
      active: s.active !== false,
    };
  });

  // Sort
  const validSortFields = [
    "name",
    "students",
    "attendance",
    "content",
    "submission",
  ];
  const field = validSortFields.includes(sortBy) ? sortBy : "name";
  const order = sortOrder === "desc" ? -1 : 1;
  schoolAnalytics.sort((a, b) => {
    if (typeof a[field] === "string") {
      return order * a[field].localeCompare(b[field]);
    }
    return order * (a[field] - b[field]);
  });

  // Compute aggregated stats across ALL schools (not just current page)
  // Use full aggregation for accuracy
  const [globalAttendance, globalChapters, globalSubmissions] =
    await Promise.all([
      Attendance.aggregate([
        { $match: { date: { $gte: thirtyDaysAgo, $lte: today } } },
        { $unwind: "$records" },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: {
              $sum: { $cond: [{ $eq: ["$records.status", "P"] }, 1, 0] },
            },
          },
        },
      ]),
      Chapter.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: {
              $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
            },
          },
        },
      ]),
      Assignment.aggregate([
        { $match: { status: "published" } },
        {
          $lookup: {
            from: "submissions",
            localField: "_id",
            foreignField: "assignmentId",
            as: "subs",
          },
        },
        { $unwind: { path: "$subs", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalExpected: { $sum: 1 },
            submitted: {
              $sum: { $cond: [{ $ifNull: ["$subs._id", false] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

  const gAtt = globalAttendance[0];
  const gCh = globalChapters[0];
  const gSub = globalSubmissions[0];

  // At-risk: schools with attendance < 60% or content < 30%
  // Count from all schools (need an extra lightweight aggregation)
  const atRiskStudents = await User.countDocuments({
    role: "STUDENT",
    active: true,
    schoolId: {
      $in: (
        await Attendance.aggregate([
          { $match: { date: { $gte: thirtyDaysAgo, $lte: today } } },
          { $unwind: "$records" },
          {
            $group: {
              _id: "$schoolId",
              total: { $sum: 1 },
              present: {
                $sum: { $cond: [{ $eq: ["$records.status", "P"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              pct: {
                $cond: [
                  { $gt: ["$total", 0] },
                  { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
                  0,
                ],
              },
            },
          },
          { $match: { pct: { $lt: 60 } } },
        ])
      ).map((r) => r._id),
    },
  });

  // Top 3 and bottom 3 across ALL schools (fetch separately if paginated)
  const allSchoolIds = await School.find(schoolFilter).select("_id").lean();
  const allIds = allSchoolIds.map((s) => s._id);

  const [allAttAgg, allChAgg] = await Promise.all([
    Attendance.aggregate([
      {
        $match: {
          schoolId: { $in: allIds },
          date: { $gte: thirtyDaysAgo, $lte: today },
        },
      },
      { $unwind: "$records" },
      {
        $group: {
          _id: "$schoolId",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$records.status", "P"] }, 1, 0] },
          },
        },
      },
    ]),
    Chapter.aggregate([
      { $match: { schoolId: { $in: allIds } } },
      {
        $group: {
          _id: "$schoolId",
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const allAttMap = toMap(allAttAgg);
  const allChMap = toMap(allChAgg);
  const allSchoolNames = await School.find({ _id: { $in: allIds } })
    .select("name")
    .lean();
  const nameMap = {};
  allSchoolNames.forEach((s) => (nameMap[s._id.toString()] = s.name));

  const ranked = allIds.map((id) => {
    const sid = id.toString();
    const att = allAttMap[sid];
    const ch = allChMap[sid];
    const attendance =
      att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
    const content =
      ch && ch.total > 0 ? Math.round((ch.published / ch.total) * 100) : 0;
    return {
      _id: id,
      name: nameMap[sid] || "Unknown",
      attendance,
      content,
      score: attendance + content,
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  const topPerforming = ranked.slice(0, 3);
  const needingIntervention = [...ranked]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  res.json({
    summary: {
      avgContentCoverage:
        gCh && gCh.total > 0
          ? Math.round((gCh.published / gCh.total) * 100)
          : 0,
      avgAttendance:
        gAtt && gAtt.total > 0
          ? Math.round((gAtt.present / gAtt.total) * 100)
          : 0,
      assignmentSubmission:
        gSub && gSub.totalExpected > 0
          ? Math.round((gSub.submitted / gSub.totalExpected) * 100)
          : 0,
      atRiskStudents,
    },
    schools: schoolAnalytics,
    topPerforming,
    needingIntervention,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalSchools,
      totalPages: Math.ceil(totalSchools / limitNum),
    },
    globalCounts: {
      totalSchools: await School.countDocuments(),
      totalStudents: allStudents,
      totalTeachers: allTeachers,
    },
  });
};
