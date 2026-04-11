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
const StudentNote = require("./models/StudentNote");

/* ── helpers ─────────────────────────────────────────────────── */
const rng = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rngInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function pastWeekdays(count) {
  const dates = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow > 0 && dow < 6) dates.push(new Date(d));
  }
  return dates.reverse();
}

/* ── static data ─────────────────────────────────────────────── */
const SCHOOLS = [
  {
    name: "Shree Janata Secondary School",
    address: "Ward 5, Kathmandu",
    phone: "01-4100001",
  },
  {
    name: "Saraswati Basic School",
    address: "Ward 3, Lalitpur",
    phone: "01-4100002",
  },
  {
    name: "Nepal Rastriya Secondary School",
    address: "Ward 7, Bhaktapur",
    phone: "01-4100003",
  },
  {
    name: "Budhanilkantha Higher Secondary",
    address: "Ward 12, Kathmandu",
    phone: "01-4100004",
  },
  {
    name: "Pashupati Secondary School",
    address: "Ward 9, Kathmandu",
    phone: "01-4100005",
  },
  {
    name: "Gyanodaya Boarding School",
    address: "Ward 2, Lalitpur",
    phone: "01-4100006",
  },
  {
    name: "Himalayan Model School",
    address: "Ward 6, Bhaktapur",
    phone: "01-4100007",
  },
  {
    name: "Siddhartha Basic School",
    address: "Ward 4, Kathmandu",
    phone: "01-4100008",
  },
  {
    name: "Tribhuvan Secondary School",
    address: "Ward 8, Lalitpur",
    phone: "01-4100009",
  },
  {
    name: "Mahendra Higher Secondary",
    address: "Ward 11, Kathmandu",
    phone: "01-4100010",
  },
];

const PRINCIPAL_NAMES = [
  "Ram Bahadur Thapa",
  "Sita Kumari Shrestha",
  "Hari Prasad Adhikari",
  "Kamala Devi Bista",
  "Krishna Bahadur Rai",
  "Gita Kumari Tamang",
  "Bishnu Prasad Pandey",
  "Sarita Devi Gurung",
  "Gopal Bahadur K.C.",
  "Meena Kumari Lama",
];

const TEACHER_FIRST = [
  "Ram",
  "Shyam",
  "Hari",
  "Sita",
  "Gita",
  "Sunita",
  "Kamala",
  "Binod",
  "Prakash",
  "Raju",
  "Puja",
  "Anita",
  "Bikash",
  "Deepak",
  "Sabina",
  "Nabin",
  "Mina",
  "Sarita",
  "Bishnu",
  "Laxmi",
];
const TEACHER_LAST = [
  "Karki",
  "Maharjan",
  "Ghimire",
  "Bista",
  "Shrestha",
  "Tamang",
  "Gurung",
  "Rai",
  "Thapa",
  "Pandey",
  "Adhikari",
  "Lama",
];

const STUDENT_FIRST = [
  "Aarav",
  "Aayush",
  "Abishek",
  "Anish",
  "Arun",
  "Arjun",
  "Bibek",
  "Binaya",
  "Bipin",
  "Bishal",
  "Dipak",
  "Dipesh",
  "Gaurav",
  "Hari",
  "Ishwor",
  "Kiran",
  "Manish",
  "Nabin",
  "Niraj",
  "Pawan",
  "Prabin",
  "Rajesh",
  "Rajan",
  "Rohan",
  "Roshan",
  "Sachin",
  "Samir",
  "Sanjay",
  "Santosh",
  "Saroj",
  "Sujan",
  "Sunil",
  "Sushil",
  "Ujjwal",
  "Yogesh",
  "Aakriti",
  "Anjali",
  "Asmita",
  "Binita",
  "Deepa",
  "Ganga",
  "Kabita",
  "Kritika",
  "Laxmi",
  "Manisha",
  "Nisha",
  "Priya",
  "Puja",
  "Radhika",
  "Renu",
  "Reshma",
  "Sabina",
  "Sangita",
  "Sapana",
  "Sarina",
  "Sita",
  "Sunita",
  "Sushma",
  "Tulsi",
  "Uma",
];
const STUDENT_LAST = [
  "Adhikari",
  "Bhandari",
  "B.K.",
  "Chaudhary",
  "Dahal",
  "Dhakal",
  "Dongol",
  "Gautam",
  "Ghimire",
  "Gurung",
  "Joshi",
  "K.C.",
  "Karki",
  "Khadka",
  "Koirala",
  "Lama",
  "Maharjan",
  "Magar",
  "Nepal",
  "Pandey",
  "Poudel",
  "Rai",
  "Sharma",
  "Shrestha",
  "Tamang",
  "Thapa",
];

const SUBJECTS_PER_GRADE = {
  8: ["Science", "Mathematics", "Nepali", "English", "Social Studies"],
  9: ["Science", "Mathematics", "Nepali", "English", "Social Studies"],
  10: ["Science", "Mathematics", "Nepali", "English", "Social Studies"],
};
const SUBJECT_COLORS = {
  Science: "#2563eb",
  Mathematics: "#059669",
  Nepali: "#7c3aed",
  English: "#dc2626",
  "Social Studies": "#d97706",
};

/* chapter + topic templates per subject */
const CURRICULUM = {
  Science: [
    {
      ch: "Force and Motion",
      topics: ["Newton's Laws", "Friction", "Gravity"],
    },
    { ch: "Light and Optics", topics: ["Reflection", "Refraction", "Lenses"] },
    {
      ch: "Chemical Reactions",
      topics: ["Acids and Bases", "Oxidation", "Balancing Equations"],
    },
    {
      ch: "Living Organisms",
      topics: ["Cell Structure", "Photosynthesis", "Respiration"],
    },
  ],
  Mathematics: [
    {
      ch: "Algebra",
      topics: ["Linear Equations", "Quadratic Equations", "Polynomials"],
    },
    { ch: "Geometry", topics: ["Triangles", "Circles", "Coordinate Geometry"] },
    {
      ch: "Statistics",
      topics: ["Mean Median Mode", "Probability", "Data Representation"],
    },
    {
      ch: "Trigonometry",
      topics: ["Ratios", "Heights and Distances", "Identities"],
    },
  ],
  Nepali: [
    {
      ch: "Gadya (Prose)",
      topics: ["Story Comprehension", "Essay Writing", "Letter Writing"],
    },
    {
      ch: "Padya (Poetry)",
      topics: ["Poem Analysis", "Rhyme Patterns", "Nepali Poets"],
    },
    { ch: "Vyakaran (Grammar)", topics: ["Sandhi", "Samas", "Karak"] },
    {
      ch: "Sahitya (Literature)",
      topics: ["Muna Madan", "Nepali Drama", "Modern Literature"],
    },
  ],
  English: [
    {
      ch: "Reading Comprehension",
      topics: ["Passage Analysis", "Vocabulary Building", "Inference"],
    },
    {
      ch: "Grammar",
      topics: ["Tenses", "Active Passive Voice", "Reported Speech"],
    },
    {
      ch: "Writing Skills",
      topics: ["Essay Writing", "Paragraph Writing", "Letter Format"],
    },
    { ch: "Literature", topics: ["Short Stories", "Poetry Analysis", "Drama"] },
  ],
  "Social Studies": [
    {
      ch: "Our Country Nepal",
      topics: ["Geography", "Administrative Divisions", "Natural Resources"],
    },
    {
      ch: "History",
      topics: ["Unification of Nepal", "Rana Period", "Democracy Movement"],
    },
    {
      ch: "Civics",
      topics: ["Constitution", "Fundamental Rights", "Government Structure"],
    },
    {
      ch: "Economics",
      topics: ["National Income", "Taxation", "Development Planning"],
    },
  ],
};

const NOTICE_TITLES = [
  "Annual Sports Day Announcement",
  "Parent-Teacher Meeting Schedule",
  "Examination Schedule Published",
  "Holiday Notice - Dashain",
  "Library New Books Arrival",
  "Extra Class Schedule",
  "School Bus Route Change",
  "Annual Day Celebration",
  "Mid-term Results Available",
  "Health Check-up Camp",
];

/* ================================================================== */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  /* ── 0. Wipe ──────────────────────────────────────── */
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
    StudentNote.deleteMany(),
  ]);
  // Drop stale indexes that may exist from old schema versions
  try {
    await mongoose.connection.collection("attendances").dropIndexes();
  } catch (_) {}
  try {
    await mongoose.connection.collection("submissions").dropIndexes();
  } catch (_) {}
  // Re-sync current indexes
  await Attendance.syncIndexes();
  await Submission.syncIndexes();
  console.log("Cleared all collections + synced indexes");

  /* ── 1. Super Admin ───────────────────────────────── */
  const superAdmin = await User.create({
    name: "Municipality Admin",
    email: "admin@municipality.gov.np",
    password: "password123",
    role: "SUPER_ADMIN",
  });
  console.log("Super admin created");

  /* ── 2. Notices from municipality ─────────────────── */
  await Notice.insertMany([
    {
      authorId: superAdmin._id,
      title: "Welcome to EduNepal Platform",
      body: "All schools are now registered on the digital platform. Principals, please complete your school profiles.",
      from: "municipality",
      category: "general",
      priority: "high",
    },
    {
      authorId: superAdmin._id,
      title: "Teacher Training Workshop",
      body: "A two-day ICT training workshop will be held on Mangsir 15-16, 2083. All computer teachers must attend.",
      from: "municipality",
      category: "event",
      priority: "medium",
    },
  ]);

  /* ── 3. Schools + Principals ──────────────────────── */
  const schoolDocs = [];
  const principalDocs = [];
  for (let si = 0; si < 10; si++) {
    const s = SCHOOLS[si];
    const school = await School.create({
      municipalityId: superAdmin._id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu Metropolitan City",
      ward: String(rngInt(1, 32)),
      academicYear: "2083",
      schoolLevel: "Secondary (1-12)",
      managementType: si % 2 === 0 ? "Community" : "Institutional",
    });
    const slug = s.name
      .toLowerCase()
      .replace(/[^a-z]+/g, "")
      .slice(0, 8);
    const principal = await User.create({
      name: PRINCIPAL_NAMES[si],
      email: "principal@" + slug + ".edu.np",
      password: "password123",
      role: "SCHOOL_ADMIN",
      schoolId: school._id,
      phone: "984" + String(1000000 + si),
    });
    school.principalId = principal._id;
    await school.save();
    schoolDocs.push(school);
    principalDocs.push(principal);
  }
  console.log("10 schools + principals created");

  /* ── 4. Per-school: classes, teachers, subjects, students, content, attendance, assignments ─── */
  const past25 = pastWeekdays(25); // last 25 working days
  let totalTeachers = 0,
    totalStudents = 0,
    totalAttendance = 0,
    totalChapters = 0,
    totalTopics = 0,
    totalAssignments = 0,
    totalSubmissions = 0;

  for (let si = 0; si < 10; si++) {
    const school = schoolDocs[si];
    const principal = principalDocs[si];
    const sid = school._id;
    console.log(`\n--- School ${si + 1}: ${school.name} ---`);

    /* 4a. Classes: grades 8,9,10 sections A,B */
    const classDocs = [];
    for (const grade of [8, 9, 10]) {
      for (const section of ["A", "B"]) {
        classDocs.push(
          await Class.create({
            schoolId: sid,
            grade,
            section,
            academicYear: "2083",
          }),
        );
      }
    }
    console.log("  6 classes created (grades 8-10 × A,B)");

    /* 4b. 10 Teachers – each gets ~3 subjects across classes */
    const teacherDocs = [];
    const usedNames = new Set();
    for (let ti = 0; ti < 10; ti++) {
      let first, last, fullName;
      do {
        first = TEACHER_FIRST[rngInt(0, TEACHER_FIRST.length - 1)];
        last = TEACHER_LAST[rngInt(0, TEACHER_LAST.length - 1)];
        fullName = first + " " + last;
      } while (usedNames.has(fullName));
      usedNames.add(fullName);

      const slug = school.name
        .toLowerCase()
        .replace(/[^a-z]+/g, "")
        .slice(0, 6);
      teacherDocs.push(
        await User.create({
          name: fullName,
          email:
            first.toLowerCase() +
            "." +
            last.toLowerCase() +
            "." +
            si +
            "@" +
            slug +
            ".edu.np",
          password: "password123",
          role: "TEACHER",
          schoolId: sid,
          phone: "98" + String(41000000 + si * 100 + ti),
        }),
      );
    }
    totalTeachers += 10;
    console.log("  10 teachers created");

    /* 4c. Subjects for every class — assign teachers round-robin */
    const subjectDocs = []; // flat list
    const classSubjectMap = new Map(); // classId → [subjectDoc]
    const teacherClassMap = new Map(); // teacherId → Set<classId>
    const teacherSubjectMap = new Map(); // teacherId → Set<subjectId>

    let tIdx = 0; // round-robin teacher index
    for (const cls of classDocs) {
      const subNames = SUBJECTS_PER_GRADE[cls.grade];
      const classSubs = [];
      for (const subName of subNames) {
        const teacher = teacherDocs[tIdx % teacherDocs.length];
        tIdx++;
        const sub = await Subject.create({
          schoolId: sid,
          classId: cls._id,
          name: subName,
          teacherId: teacher._id,
          color: SUBJECT_COLORS[subName] || "#666",
        });
        classSubs.push(sub);
        subjectDocs.push(sub);

        // track
        if (!teacherClassMap.has(teacher._id.toString()))
          teacherClassMap.set(teacher._id.toString(), new Set());
        teacherClassMap.get(teacher._id.toString()).add(cls._id.toString());

        if (!teacherSubjectMap.has(teacher._id.toString()))
          teacherSubjectMap.set(teacher._id.toString(), new Set());
        teacherSubjectMap.get(teacher._id.toString()).add(sub._id.toString());
      }
      classSubjectMap.set(cls._id.toString(), classSubs);
    }
    console.log(`  ${subjectDocs.length} subjects assigned`);

    /* update teacher classIds and subjectIds */
    for (const t of teacherDocs) {
      const cSet = teacherClassMap.get(t._id.toString());
      const sSet = teacherSubjectMap.get(t._id.toString());
      if (cSet || sSet) {
        t.classIds = cSet
          ? [...cSet].map((id) => new mongoose.Types.ObjectId(id))
          : [];
        t.subjectIds = sSet
          ? [...sSet].map((id) => new mongoose.Types.ObjectId(id))
          : [];
        await t.save();
      }
    }

    /* 4d. 20 Students per class — shared across all subjects in that class */
    const classStudentMap = new Map(); // classId → [studentDoc]
    const usedStudentNames = new Set();
    for (const cls of classDocs) {
      const studs = [];
      for (let sti = 1; sti <= 20; sti++) {
        let first, last, full;
        do {
          first = STUDENT_FIRST[rngInt(0, STUDENT_FIRST.length - 1)];
          last = STUDENT_LAST[rngInt(0, STUDENT_LAST.length - 1)];
          full = first + " " + last;
        } while (usedStudentNames.has(full + cls._id.toString()));
        usedStudentNames.add(full + cls._id.toString());

        const slug = school.name
          .toLowerCase()
          .replace(/[^a-z]+/g, "")
          .slice(0, 6);
        studs.push(
          await User.create({
            name: full,
            email:
              first.toLowerCase() +
              sti +
              ".g" +
              cls.grade +
              cls.section.toLowerCase() +
              "." +
              si +
              "@" +
              slug +
              ".edu.np",
            password: "password123",
            role: "STUDENT",
            schoolId: sid,
            classId: cls._id,
            section: cls.section,
            rollNumber: String(sti),
            phone: "98" + String(10000000 + si * 10000 + cls.grade * 100 + sti),
          }),
        );
      }
      classStudentMap.set(cls._id.toString(), studs);
      totalStudents += 20;
    }
    console.log(`  ${classDocs.length * 20} students created`);

    /* 4e. Attendance — one record per class per weekday for past 25 days */
    const attendanceBulk = [];
    for (const cls of classDocs) {
      const studs = classStudentMap.get(cls._id.toString());
      // pick the first teacher assigned to this class
      const classTeacher = classSubjectMap.get(cls._id.toString())[0].teacherId;

      for (const date of past25) {
        const records = studs.map((s) => ({
          studentId: s._id,
          status: Math.random() < 0.85 ? "P" : "A", // ~85% present
        }));
        attendanceBulk.push({
          schoolId: sid,
          classId: cls._id,
          teacherId: classTeacher,
          date,
          records,
        });
      }
    }
    await Attendance.insertMany(attendanceBulk);
    totalAttendance += attendanceBulk.length;
    console.log(
      `  ${attendanceBulk.length} attendance records (6 classes × 25 days)`,
    );

    /* 4f. Chapters + Topics per subject */
    const chapterBulk = [];
    const topicBulk = []; // will insert after chapters so we have _ids
    for (const sub of subjectDocs) {
      const curriculum = CURRICULUM[sub.name] || CURRICULUM["Science"];
      const gradeLabel =
        classDocs.find((c) => c._id.toString() === sub.classId.toString())
          ?.grade || 10;

      for (let ci = 0; ci < curriculum.length; ci++) {
        const tmpl = curriculum[ci];
        const chapterObj = {
          subjectId: sub._id,
          schoolId: sid,
          title: `${tmpl.ch} (Grade ${gradeLabel})`,
          description: `${tmpl.ch} chapter for Grade ${gradeLabel} ${sub.name}`,
          order: ci + 1,
          status: ci < 3 ? "published" : "draft",
        };
        chapterBulk.push(chapterObj);
      }
    }
    const chapters = await Chapter.insertMany(chapterBulk);
    totalChapters += chapters.length;

    // now topics
    let chIdx = 0;
    for (const sub of subjectDocs) {
      const curriculum = CURRICULUM[sub.name] || CURRICULUM["Science"];
      for (let ci = 0; ci < curriculum.length; ci++) {
        const ch = chapters[chIdx++];
        const tmpl = curriculum[ci];
        for (let ti = 0; ti < tmpl.topics.length; ti++) {
          topicBulk.push({
            chapterId: ch._id,
            title: tmpl.topics[ti],
            type: rng(["note", "video", "pdf"]),
            content: `Detailed notes on ${tmpl.topics[ti]} for ${sub.name}.`,
            order: ti + 1,
          });
        }
      }
    }
    await Topic.insertMany(topicBulk);
    totalTopics += topicBulk.length;
    console.log(`  ${chapters.length} chapters, ${topicBulk.length} topics`);

    /* 4g. Assignments + Submissions per subject */
    const assignmentBulk = [];
    for (const sub of subjectDocs) {
      const cls = classDocs.find(
        (c) => c._id.toString() === sub.classId.toString(),
      );
      const curriculum = CURRICULUM[sub.name] || CURRICULUM["Science"];
      // 2 assignments per subject
      for (let ai = 0; ai < 2; ai++) {
        const due = new Date(past25[rngInt(10, 24)]);
        assignmentBulk.push({
          subjectId: sub._id,
          schoolId: sid,
          classId: sub.classId,
          teacherId: sub.teacherId,
          title: `${curriculum[ai]?.ch || "Chapter"} — Practice Assignment ${ai + 1}`,
          description: `Complete the exercises related to ${curriculum[ai]?.ch || "the chapter"}.`,
          dueDate: due,
          maxMarks: rng([20, 25, 50]),
          allowLate: ai === 0,
          status: "published",
        });
      }
    }
    const assignments = await Assignment.insertMany(assignmentBulk);
    totalAssignments += assignments.length;

    // Submissions: ~80% of students submit each assignment
    const submissionBulk = [];
    for (const asn of assignments) {
      const studs = classStudentMap.get(asn.classId.toString());
      if (!studs) continue;
      for (const s of studs) {
        if (Math.random() < 0.2) continue; // 20% miss
        const submitted = new Date(asn.dueDate);
        submitted.setDate(submitted.getDate() - rngInt(0, 3));
        const late = submitted > asn.dueDate;
        const graded = Math.random() < 0.6;
        submissionBulk.push({
          assignmentId: asn._id,
          studentId: s._id,
          textContent: `My solution for ${asn.title}`,
          submittedAt: submitted,
          late,
          marks: graded
            ? rngInt(Math.floor(asn.maxMarks * 0.4), asn.maxMarks)
            : undefined,
          status: graded ? "graded" : "submitted",
          feedback: graded
            ? rng([
                "Good work!",
                "Needs improvement",
                "Excellent effort",
                "Review your answers",
                "Well done",
              ])
            : undefined,
        });
      }
    }
    await Submission.insertMany(submissionBulk);
    totalSubmissions += submissionBulk.length;
    console.log(
      `  ${assignments.length} assignments, ${submissionBulk.length} submissions`,
    );

    /* 4h. School-level notices from principal */
    const schoolNotices = NOTICE_TITLES.slice(0, 5).map((t, i) => ({
      schoolId: sid,
      authorId: principal._id,
      title: t,
      body: `Details regarding ${t.toLowerCase()} for ${school.name}. Please check the schedule and plan accordingly.`,
      from: "school",
      scope: "global",
      category: rng(["general", "event", "holiday", "exam_schedule"]),
      priority: rng(["low", "medium", "high"]),
    }));
    await Notice.insertMany(schoolNotices);

    /* 4h2. Class-specific notices from teachers */
    const classNoticesBulk = [];
    for (const cls of classDocs) {
      const teacher =
        teacherDocs.find((t) =>
          t.classIds?.some((cid) => cid.toString() === cls._id.toString()),
        ) || teacherDocs[0];
      const titles = [
        `Grade ${cls.grade}${cls.section || ""} - Weekly Test Schedule`,
        `Grade ${cls.grade}${cls.section || ""} - Project Submission Reminder`,
        `Grade ${cls.grade}${cls.section || ""} - Parent Meeting Notice`,
      ];
      titles.forEach((title, idx) => {
        classNoticesBulk.push({
          schoolId: sid,
          authorId: teacher._id,
          title,
          body: `Important notice for students of Grade ${cls.grade}${cls.section || ""}. Please read carefully and inform your parents.`,
          from: "school",
          scope: "class",
          classId: cls._id,
          category: rng(["general", "exam_schedule", "event"]),
          priority: rng(["low", "medium", "high"]),
        });
      });
    }
    await Notice.insertMany(classNoticesBulk);

    /* 4i. Student notes from teachers */
    const noteBulk = [];
    for (const cls of classDocs) {
      const studs = classStudentMap.get(cls._id.toString());
      const teacher = teacherDocs[0]; // class teacher
      // Notes for a few students
      for (let ni = 0; ni < 3; ni++) {
        noteBulk.push({
          studentId: studs[ni]._id,
          teacherId: teacher._id,
          content: rng([
            "Shows great improvement in recent tests",
            "Needs to focus more on homework completion",
            "Very active in class participation",
            "Attendance is low, parent meeting needed",
            "Excellent performance in group activities",
          ]),
        });
      }
    }
    await StudentNote.insertMany(noteBulk);

    console.log(`  School ${si + 1} complete ✓`);
  }

  /* ── Summary ───────────────────────────────────────── */
  console.log("\n=========== SEED COMPLETE ===========");
  console.log(`Schools:      10`);
  console.log(`Principals:   10`);
  console.log(`Teachers:     ${totalTeachers}`);
  console.log(`Students:     ${totalStudents}`);
  console.log(`Attendance:   ${totalAttendance} records`);
  console.log(`Chapters:     ${totalChapters}`);
  console.log(`Topics:       ${totalTopics}`);
  console.log(`Assignments:  ${totalAssignments}`);
  console.log(`Submissions:  ${totalSubmissions}`);
  console.log("=====================================");
  console.log("\nCredentials (all passwords: password123):");
  console.log("  Super Admin: admin@municipality.gov.np");
  console.log(
    "  Principals:  principal@shreejana.edu.np, principal@saraswat.edu.np, ...",
  );
  console.log(
    "  Teachers:    <firstname>.<lastname>.<schoolIdx>@<school>.edu.np",
  );
  console.log(
    "  Students:    <firstname><roll>.g<grade><section>.<schoolIdx>@<school>.edu.np",
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
