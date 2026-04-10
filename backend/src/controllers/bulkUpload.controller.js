const XLSX = require("xlsx");
const User = require("../models/User");
const Class = require("../models/Class");

// ─── Sample Excel generation ───

exports.teacherSample = (req, res) => {
  const wb = XLSX.utils.book_new();
  const data = [
    ["name", "email", "phone"],
    ["Ram Bahadur Karki", "ram.karki@school.edu.np", "9841000001"],
    ["Sunita Maharjan", "sunita.maharjan@school.edu.np", "9841000002"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 25 }, { wch: 35 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, "Teachers");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="teacher_sample.xlsx"',
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.send(buf);
};

exports.studentSample = async (req, res) => {
  const classes = await Class.find({ schoolId: req.user.schoolId }).sort({
    grade: 1,
    section: 1,
  });
  const classOptions = classes.map((c) => `${c.grade}-${c.section}`).join(", ");

  const wb = XLSX.utils.book_new();
  const data = [
    ["name", "email", "phone", "rollNumber", "class"],
    [
      "Aarav Poudel",
      "aarav.poudel@school.edu.np",
      "9800000001",
      "01",
      classes.length ? `${classes[0].grade}-${classes[0].section}` : "10-A",
    ],
    [
      "Gita Gurung",
      "gita.gurung@school.edu.np",
      "9800000002",
      "02",
      classes.length ? `${classes[0].grade}-${classes[0].section}` : "10-A",
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
  ];

  // Add a note about the class format
  const noteSheet = XLSX.utils.aoa_to_sheet([
    ["Instructions"],
    [""],
    ['The "class" column must use the format: grade-section (e.g. 10-A, 9-B)'],
    [""],
    ["Available classes in your school:"],
    [classOptions || "No classes created yet"],
    [""],
    ["Maximum 50 students per upload"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.utils.book_append_sheet(wb, noteSheet, "Instructions");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="student_sample.xlsx"',
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.send(buf);
};

// ─── Bulk upload teachers ───

exports.bulkUploadTeachers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let rows;
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  } catch {
    return res.status(400).json({ message: "Invalid Excel file" });
  }

  if (!rows.length) {
    return res.status(400).json({ message: "Excel file is empty" });
  }

  // Validate required columns
  const first = rows[0];
  if (!("name" in first) || !("email" in first)) {
    return res.status(400).json({
      message:
        'Excel must have "name" and "email" columns. Download the sample for reference.',
    });
  }

  const results = { created: [], errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-based + header
    const name = String(row.name || "").trim();
    const email = String(row.email || "")
      .trim()
      .toLowerCase();
    const phone = String(row.phone || "").trim();

    if (!name) {
      results.errors.push({ row: rowNum, email, reason: "Name is required" });
      continue;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.errors.push({
        row: rowNum,
        email: email || "(empty)",
        reason: "Invalid email",
      });
      continue;
    }

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      results.errors.push({
        row: rowNum,
        email,
        reason: "Email already exists",
      });
      continue;
    }

    try {
      const user = await User.create({
        name,
        email,
        phone: phone || undefined,
        password: "password123",
        role: "TEACHER",
        schoolId: req.user.schoolId,
      });
      results.created.push({ name: user.name, email: user.email });
    } catch (err) {
      results.errors.push({
        row: rowNum,
        email,
        reason: err.message || "Failed to create",
      });
    }
  }

  res.json({
    message: `Created ${results.created.length} teacher(s). ${results.errors.length} error(s).`,
    created: results.created,
    errors: results.errors,
    totalProcessed: rows.length,
  });
};

// ─── Bulk upload students ───

exports.bulkUploadStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let rows;
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  } catch {
    return res.status(400).json({ message: "Invalid Excel file" });
  }

  if (!rows.length) {
    return res.status(400).json({ message: "Excel file is empty" });
  }

  if (rows.length > 50) {
    return res.status(400).json({
      message: `Maximum 50 students per upload. Your file has ${rows.length} rows.`,
    });
  }

  // Validate required columns
  const first = rows[0];
  if (!("name" in first) || !("email" in first) || !("class" in first)) {
    return res.status(400).json({
      message:
        'Excel must have "name", "email", and "class" columns. Download the sample for reference.',
    });
  }

  // Pre-load classes for this school
  const classes = await Class.find({ schoolId: req.user.schoolId });
  const classMap = {};
  classes.forEach((c) => {
    classMap[`${c.grade}-${c.section}`] = c._id;
  });

  const results = { created: [], errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const name = String(row.name || "").trim();
    const email = String(row.email || "")
      .trim()
      .toLowerCase();
    const phone = String(row.phone || "").trim();
    const rollNumber = String(row.rollNumber || "").trim();
    const classStr = String(row.class || "").trim();

    if (!name) {
      results.errors.push({ row: rowNum, email, reason: "Name is required" });
      continue;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.errors.push({
        row: rowNum,
        email: email || "(empty)",
        reason: "Invalid email",
      });
      continue;
    }
    if (!classStr) {
      results.errors.push({
        row: rowNum,
        email,
        reason: 'Class is required (format: "10-A")',
      });
      continue;
    }

    const classId = classMap[classStr];
    if (!classId) {
      results.errors.push({
        row: rowNum,
        email,
        reason: `Class "${classStr}" not found. Available: ${Object.keys(classMap).join(", ")}`,
      });
      continue;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      results.errors.push({
        row: rowNum,
        email,
        reason: "Email already exists",
      });
      continue;
    }

    try {
      const user = await User.create({
        name,
        email,
        phone: phone || undefined,
        rollNumber: rollNumber || undefined,
        password: "password123",
        role: "STUDENT",
        schoolId: req.user.schoolId,
        classId,
      });
      results.created.push({ name: user.name, email: user.email });
    } catch (err) {
      results.errors.push({
        row: rowNum,
        email,
        reason: err.message || "Failed to create",
      });
    }
  }

  res.json({
    message: `Created ${results.created.length} student(s). ${results.errors.length} error(s).`,
    created: results.created,
    errors: results.errors,
    totalProcessed: rows.length,
  });
};
