const School = require("../models/School");
const User = require("../models/User");

exports.getAll = async (req, res) => {
  const { page, limit, search = "", status: statusFilter } = req.query;

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (statusFilter === "active") {
    filter.principalId = { $ne: null };
    filter.active = { $ne: false };
  } else if (statusFilter === "no_principal") {
    filter.$or = [{ principalId: null }, { principalId: { $exists: false } }];
  }

  // If no pagination params, return all (backward-compatible)
  if (!page && !limit) {
    const schools = await School.find(filter).populate(
      "principalId",
      "name email phone",
    );
    return res.json(schools);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, schools] = await Promise.all([
    School.countDocuments(filter),
    School.find(filter)
      .populate("principalId", "name email phone")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  // Batch-fetch student & teacher counts for these schools
  const schoolIds = schools.map((s) => s._id);
  const [studentCounts, teacherCounts] = await Promise.all([
    User.aggregate([
      {
        $match: { schoolId: { $in: schoolIds }, role: "STUDENT", active: true },
      },
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]),
    User.aggregate([
      {
        $match: { schoolId: { $in: schoolIds }, role: "TEACHER", active: true },
      },
      { $group: { _id: "$schoolId", count: { $sum: 1 } } },
    ]),
  ]);

  const studentMap = {};
  studentCounts.forEach((r) => (studentMap[r._id.toString()] = r.count));
  const teacherMap = {};
  teacherCounts.forEach((r) => (teacherMap[r._id.toString()] = r.count));

  const enriched = schools.map((s) => ({
    ...s,
    studentCount: studentMap[s._id.toString()] || 0,
    teacherCount: teacherMap[s._id.toString()] || 0,
  }));

  res.json({
    schools: enriched,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

exports.getById = async (req, res) => {
  const school = await School.findById(req.params.id).populate(
    "principalId",
    "name email",
  );
  if (!school) return res.status(404).json({ message: "School not found" });
  res.json(school);
};

exports.create = async (req, res) => {
  const { principal, ...schoolData } = req.body;

  // Create school first
  const school = await School.create({
    ...schoolData,
    municipalityId: req.user._id,
  });

  // Create principal user if provided
  if (principal && principal.phone) {
    const existing = await User.findOne({ phone: principal.phone });
    if (existing) {
      await School.findByIdAndDelete(school._id);
      return res
        .status(400)
        .json({ message: "A user with that phone number already exists" });
    }

    const principalUser = await User.create({
      name: principal.name,
      email: principal.email || `principal_${school._id}@school.edu.np`,
      password: principal.password || "changeme123",
      role: "SCHOOL_ADMIN",
      schoolId: school._id,
      phone: principal.phone,
    });
    school.principalId = principalUser._id;
    await school.save();
  }

  const populated = await School.findById(school._id).populate(
    "principalId",
    "name email phone",
  );
  res.status(201).json(populated);
};

exports.update = async (req, res) => {
  const school = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!school) return res.status(404).json({ message: "School not found" });
  res.json(school);
};

exports.getStats = async (req, res) => {
  const schoolId = req.params.id;
  const Class = require("../models/Class");
  const Subject = require("../models/Subject");
  const Attendance = require("../models/Attendance");
  const Chapter = require("../models/Chapter");
  const Assignment = require("../models/Assignment");
  const Submission = require("../models/Submission");
  const mongoose = require("mongoose");
  const objId = new mongoose.Types.ObjectId(schoolId);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    teachers,
    students,
    classes,
    subjects,
    attendanceAgg,
    chapterAgg,
    assignments,
    submissionAgg,
    recentTeachers,
  ] = await Promise.all([
    User.countDocuments({ schoolId, role: "TEACHER", active: true }),
    User.countDocuments({ schoolId, role: "STUDENT", active: true }),
    Class.find({ schoolId }).lean(),
    Subject.find({ schoolId }).populate("teacherId", "name").lean(),
    Attendance.aggregate([
      {
        $match: { schoolId: objId, date: { $gte: thirtyDaysAgo, $lte: today } },
      },
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
      { $match: { schoolId: objId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
        },
      },
    ]),
    Assignment.countDocuments({ schoolId, status: "published" }),
    Submission.aggregate([
      {
        $lookup: {
          from: "assignments",
          localField: "assignmentId",
          foreignField: "_id",
          as: "assignment",
        },
      },
      { $unwind: "$assignment" },
      { $match: { "assignment.schoolId": objId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          graded: { $sum: { $cond: [{ $eq: ["$status", "graded"] }, 1, 0] } },
          submitted: {
            $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
          },
        },
      },
    ]),
    User.find({ schoolId, role: "TEACHER", active: true })
      .select("name email phone")
      .limit(10)
      .lean(),
  ]);

  const att = attendanceAgg[0];
  const ch = chapterAgg[0];
  const sub = submissionAgg[0];

  // Per-class student counts
  const classSummary = await Promise.all(
    classes.map(async (cls) => {
      const count = await User.countDocuments({
        schoolId,
        classId: cls._id,
        role: "STUDENT",
        active: true,
      });
      return {
        _id: cls._id,
        grade: cls.grade,
        section: cls.section,
        academicYear: cls.academicYear,
        students: count,
      };
    }),
  );

  // Unique subject names
  const subjectNames = [...new Set(subjects.map((s) => s.name))];

  res.json({
    teachers,
    students,
    classes: classes.length,
    subjects: subjects.length,
    subjectNames,
    assignments,
    attendance: {
      percentage:
        att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 0,
      totalRecords: att?.total || 0,
      present: att?.present || 0,
    },
    content: {
      total: ch?.total || 0,
      published: ch?.published || 0,
      draft: ch?.draft || 0,
      percentage:
        ch && ch.total > 0 ? Math.round((ch.published / ch.total) * 100) : 0,
    },
    submissions: {
      total: sub?.total || 0,
      graded: sub?.graded || 0,
      pending: sub?.submitted || 0,
    },
    classSummary,
    recentTeachers,
  });
};
