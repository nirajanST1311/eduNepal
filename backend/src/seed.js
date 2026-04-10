require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
});
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const User = require("./models/User");
const School = require("./models/School");
const Class = require("./models/Class");
const Subject = require("./models/Subject");
const Attendance = require("./models/Attendance");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Chapter = require("./models/Chapter");
const Topic = require("./models/Topic");
const Notice = require("./models/Notice");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    School.deleteMany(),
    Class.deleteMany(),
    Subject.deleteMany(),
    Attendance.deleteMany(),
    Assignment.deleteMany(),
    Submission.deleteMany(),
    Chapter.deleteMany(),
    Topic.deleteMany(),
    Notice.deleteMany(),
  ]);

  // -- Super Admin --
  const superAdmin = await User.create({
    name: "Municipality Admin",
    email: "admin@municipality.gov.np",
    password: "password123",
    role: "SUPER_ADMIN",
  });

  // -- School --
  const school = await School.create({
    municipalityId: superAdmin._id,
    name: "Shree Janata Secondary School",
    address: "Ward 5, Kathmandu",
    phone: "01-4123456",
  });

  // -- Principal --
  const principal = await User.create({
    name: "Ram Bahadur Thapa",
    email: "principal@janata.edu.np",
    password: "password123",
    role: "SCHOOL_ADMIN",
    schoolId: school._id,
  });
  school.principalId = principal._id;
  await school.save();

  // -- Classes --
  const class10A = await Class.create({ schoolId: school._id, grade: 10, section: "A", academicYear: "2083" });
  const class10B = await Class.create({ schoolId: school._id, grade: 10, section: "B", academicYear: "2083" });
  const class9A = await Class.create({ schoolId: school._id, grade: 9, section: "A", academicYear: "2083" });
  const class9B = await Class.create({ schoolId: school._id, grade: 9, section: "B", academicYear: "2083" });
  const class8A = await Class.create({ schoolId: school._id, grade: 8, section: "A", academicYear: "2083" });

  const allClasses = [class10A, class10B, class9A, class9B, class8A];

  // -- Teachers --
  const teacherRam = await User.create({
    name: "Ram Bahadur Karki",
    email: "ram.karki@janata.edu.np",
    password: "password123",
    role: "TEACHER",
    schoolId: school._id,
    phone: "9841000001",
  });
  const teacherSunita = await User.create({
    name: "Sunita Maharjan",
    email: "sunita.maharjan@janata.edu.np",
    password: "password123",
    role: "TEACHER",
    schoolId: school._id,
    phone: "9841000002",
  });
  const teacherHari = await User.create({
    name: "Hari Ghimire",
    email: "hari.ghimire@janata.edu.np",
    password: "password123",
    role: "TEACHER",
    schoolId: school._id,
    phone: "9841000003",
  });
  const teacherKamala = await User.create({
    name: "Kamala Bista",
    email: "kamala.bista@janata.edu.np",
    password: "password123",
    role: "TEACHER",
    schoolId: school._id,
    phone: "9841000004",
  });

  const allTeachers = [teacherRam, teacherSunita, teacherHari, teacherKamala];

  // -- Subjects (per class) --
  const sci10A = await Subject.create({ schoolId: school._id, classId: class10A._id, name: "Science", teacherId: teacherRam._id, color: "#2563eb" });
  const math10A = await Subject.create({ schoolId: school._id, classId: class10A._id, name: "Mathematics", teacherId: teacherSunita._id, color: "#059669" });
  const nep10A = await Subject.create({ schoolId: school._id, classId: class10A._id, name: "Nepali", teacherId: teacherHari._id, color: "#7c3aed" });
  const ss10A = await Subject.create({ schoolId: school._id, classId: class10A._id, name: "Social Studies", teacherId: teacherKamala._id, color: "#d97706" });
  const eng10A = await Subject.create({ schoolId: school._id, classId: class10A._id, name: "English", teacherId: teacherRam._id, color: "#dc2626" });

  const sci10B = await Subject.create({ schoolId: school._id, classId: class10B._id, name: "Science", teacherId: teacherRam._id, color: "#2563eb" });
  const math10B = await Subject.create({ schoolId: school._id, classId: class10B._id, name: "Mathematics", teacherId: teacherSunita._id, color: "#059669" });
  const nep10B = await Subject.create({ schoolId: school._id, classId: class10B._id, name: "Nepali", teacherId: teacherHari._id, color: "#7c3aed" });
  const ss10B = await Subject.create({ schoolId: school._id, classId: class10B._id, name: "Social Studies", teacherId: teacherKamala._id, color: "#d97706" });

  const sci9A = await Subject.create({ schoolId: school._id, classId: class9A._id, name: "Science", teacherId: teacherRam._id, color: "#2563eb" });
  const math9A = await Subject.create({ schoolId: school._id, classId: class9A._id, name: "Mathematics", teacherId: teacherSunita._id, color: "#059669" });
  const nep9A = await Subject.create({ schoolId: school._id, classId: class9A._id, name: "Nepali", teacherId: teacherHari._id, color: "#7c3aed" });
  const ss9A = await Subject.create({ schoolId: school._id, classId: class9A._id, name: "Social Studies", teacherId: teacherKamala._id, color: "#d97706" });

  const sci9B = await Subject.create({ schoolId: school._id, classId: class9B._id, name: "Science", teacherId: teacherRam._id, color: "#2563eb" });
  const math9B = await Subject.create({ schoolId: school._id, classId: class9B._id, name: "Mathematics", teacherId: teacherSunita._id, color: "#059669" });
  const nep9B = await Subject.create({ schoolId: school._id, classId: class9B._id, name: "Nepali", teacherId: teacherHari._id, color: "#7c3aed" });

  const sci8A = await Subject.create({ schoolId: school._id, classId: class8A._id, name: "Science", teacherId: teacherRam._id, color: "#2563eb" });
  const math8A = await Subject.create({ schoolId: school._id, classId: class8A._id, name: "Mathematics", teacherId: teacherSunita._id, color: "#059669" });
  const nep8A = await Subject.create({ schoolId: school._id, classId: class8A._id, name: "Nepali", teacherId: teacherHari._id, color: "#7c3aed" });

  teacherRam.subjectIds = [sci10A._id, eng10A._id, sci10B._id, sci9A._id, sci9B._id, sci8A._id];
  teacherSunita.subjectIds = [math10A._id, math10B._id, math9A._id, math9B._id, math8A._id];
  teacherHari.subjectIds = [nep10A._id, nep10B._id, nep9A._id, nep9B._id, nep8A._id];
  teacherKamala.subjectIds = [ss10A._id, ss10B._id, ss9A._id];
  await Promise.all(allTeachers.map((t) => t.save()));

  // -- Students --
  const studentsByClass = {};
  const classStudentData = [
    { cls: class10A, count: 30, prefix: "10a" },
    { cls: class10B, count: 30, prefix: "10b" },
    { cls: class9A, count: 33, prefix: "9a" },
    { cls: class9B, count: 32, prefix: "9b" },
    { cls: class8A, count: 28, prefix: "8a" },
  ];

  const firstNames = [
    "Aarav", "Bibek", "Chhiring", "Deepa", "Ekta", "Firoj", "Gita", "Hari",
    "Ishwori", "Jeevan", "Kabita", "Laxmi", "Mohan", "Nisha", "Om",
    "Puja", "Rajesh", "Sita", "Tara", "Ujjwal", "Binod", "Sarita",
    "Dinesh", "Anita", "Suresh", "Mina", "Raju", "Kamala", "Bikash", "Suman",
    "Ramesh", "Durga", "Gopal",
  ];
  const lastNames = [
    "Poudel", "Gurung", "Sherpa", "Tamang", "Rai", "Khan", "Bhattarai",
    "Adhikari", "Magar", "Shrestha", "Thapa", "Karki", "Bhandari", "Ghimire",
    "Maharjan", "Basnet", "Chhetri", "Lama", "Sapkota", "Dahal",
  ];

  for (const { cls, count, prefix } of classStudentData) {
    const students = [];
    for (let i = 0; i < count; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i + cls.grade) % lastNames.length];
      const student = await User.create({
        name: fn + " " + ln,
        email: prefix + ".student" + (i + 1) + "@janata.edu.np",
        password: "password123",
        role: "STUDENT",
        schoolId: school._id,
        classId: cls._id,
        rollNumber: String(i + 1).padStart(2, "0"),
      });
      students.push(student);
    }
    studentsByClass[cls._id.toString()] = students;
  }
  console.log("Created students for all classes");

  // -- Attendance (last 30 days for each class) --
  const today = new Date();
  for (const cls of allClasses) {
    const students = studentsByClass[cls._id.toString()];
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      if (date.getDay() === 6) continue;

      const records = students.map((s) => ({
        studentId: s._id,
        status: Math.random() < 0.85 ? "P" : "A",
      }));

      try {
        await Attendance.create({
          schoolId: school._id,
          classId: cls._id,
          teacherId: teacherRam._id,
          date,
          records,
        });
      } catch (e) {
        // Skip duplicates
      }
    }
  }
  console.log("Created attendance records");

  // -- Assignments --
  const subjectsForAssignments = [
    { subject: sci10A, cls: class10A, teacher: teacherRam },
    { subject: math10A, cls: class10A, teacher: teacherSunita },
    { subject: nep10A, cls: class10A, teacher: teacherHari },
    { subject: sci9A, cls: class9A, teacher: teacherRam },
    { subject: math9A, cls: class9A, teacher: teacherSunita },
    { subject: sci10B, cls: class10B, teacher: teacherRam },
  ];

  const assignmentTitles = [
    "Chapter 1 Exercise", "Mid-term Practice Set", "Lab Report Submission",
    "Essay Writing", "Problem Set 3", "Project Proposal",
  ];

  const allAssignments = [];
  for (let i = 0; i < subjectsForAssignments.length; i++) {
    const { subject, cls, teacher } = subjectsForAssignments[i];
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + (i < 3 ? -5 : 7));
    const assignment = await Assignment.create({
      subjectId: subject._id,
      schoolId: school._id,
      classId: cls._id,
      teacherId: teacher._id,
      title: assignmentTitles[i],
      description: "Complete " + assignmentTitles[i] + " for " + subject.name,
      dueDate,
      maxMarks: 100,
      status: "published",
    });
    allAssignments.push({ assignment, cls });
  }

  for (const { assignment, cls } of allAssignments) {
    if (assignment.dueDate < today) {
      const students = studentsByClass[cls._id.toString()];
      const submitting = students.slice(0, Math.floor(students.length * 0.75));
      for (const student of submitting) {
        const marks = Math.floor(Math.random() * 40) + 60;
        await Submission.create({
          assignmentId: assignment._id,
          studentId: student._id,
          textContent: "Submitted work",
          marks: Math.random() < 0.5 ? marks : undefined,
          status: Math.random() < 0.5 ? "graded" : "submitted",
        });
      }
    }
  }
  console.log("Created assignments and submissions");

  // -- Chapters & Topics --
  const subjectsForContent = [
    { subject: sci10A, chapters: ["Force and Motion", "Energy", "Light", "Electricity", "Magnetism"] },
    { subject: math10A, chapters: ["Sets", "Arithmetic", "Algebra", "Geometry", "Trigonometry"] },
    { subject: nep10A, chapters: ["Gadya Khand", "Padya Khand", "Vyakaran", "Nibandha Lekhan"] },
    { subject: sci9A, chapters: ["Matter and Its States", "Force", "Simple Machines"] },
    { subject: math9A, chapters: ["Number System", "Ratio and Proportion", "Linear Equations"] },
    { subject: ss10A, chapters: ["History of Nepal", "Geography", "Civics", "Economics"] },
  ];

  for (const { subject, chapters } of subjectsForContent) {
    for (let i = 0; i < chapters.length; i++) {
      const statuses = ["published", "published", "published", "draft", "not_started"];
      const chapter = await Chapter.create({
        subjectId: subject._id,
        schoolId: school._id,
        title: chapters[i],
        order: i + 1,
        status: statuses[i] || "not_started",
      });
      if (chapter.status === "published") {
        await Topic.create({ chapterId: chapter._id, title: chapters[i] + " - Notes", type: "note", content: "Detailed notes for " + chapters[i], order: 1 });
        await Topic.create({ chapterId: chapter._id, title: chapters[i] + " - Video Lecture", type: "video", fileUrl: "https://example.com/video.mp4", order: 2 });
      }
    }
  }
  console.log("Created chapters and topics");

  // -- Notices --
  await Notice.create({ schoolId: school._id, authorId: principal._id, title: "Unit Test Schedule - Baisakh", body: "Unit test for all classes will be held from Baisakh 15-20. Students must bring their hall tickets. Exam starts at 10:00 AM sharp.", from: "school", category: "exam_schedule", targetAudience: "All", priority: "high" });
  await Notice.create({ schoolId: school._id, authorId: principal._id, title: "Parent-Teacher Meeting", body: "PTM for classes 9 and 10 will be held on Baisakh 25 (Saturday). Parents are requested to attend without fail.", from: "school", category: "event", targetAudience: "Parents", priority: "medium" });
  await Notice.create({ schoolId: school._id, authorId: principal._id, title: "Holiday Notice - Buddha Jayanti", body: "School will remain closed on Baisakh 29 on the occasion of Buddha Jayanti. Regular classes will resume from Jestha 1.", from: "school", category: "holiday", targetAudience: "All", priority: "low" });
  await Notice.create({ schoolId: null, authorId: superAdmin._id, title: "Municipality Education Conference", body: "All school principals are invited to attend the annual education conference at the municipality office on Jestha 5.", from: "municipality", category: "event", targetAudience: "Principals", priority: "medium" });
  console.log("Created notices");

  console.log("\nSeed completed!");
  console.log("Super Admin:  admin@municipality.gov.np / password123");
  console.log("Principal:    principal@janata.edu.np / password123");
  console.log("Teacher (Ram): ram.karki@janata.edu.np / password123");
  console.log("Student:      10a.student1@janata.edu.np / password123");
  console.log("Classes: 10A(30), 10B(30), 9A(33), 9B(32), 8A(28) = 153 students");
  console.log("Teachers: 4, Subjects: 20, Assignments: 6");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
