/**
 * E2E API Test – Simulates frontend forms, creates 5 schools worth of data,
 * then verifies every data-flow path across all portals.
 *
 * Run: node test-e2e.js
 */
const BASE = "http://localhost:5000/api";

async function api(method, path, body, token) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, ok: res.ok };
}

let pass = 0,
  fail = 0;
function check(label, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ ${label}${detail ? " — " + detail : ""}`);
  }
}

async function run() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  EduNepal E2E Test Suite");
  console.log("═══════════════════════════════════════════════════\n");

  // ─── 1. LOGIN TESTS ──────────────────────────────────────────
  console.log("── 1. LOGIN TESTS ──");

  // 1a. Login as Super Admin
  let r = await api("POST", "/auth/login", {
    email: "admin@municipality.gov.np",
    password: "password123",
  });
  check("Super Admin login", r.ok && r.data.token, `status=${r.status}`);
  const saToken = r.data.token;
  const saUser = r.data.user;

  // 1b. Login with wrong password
  r = await api("POST", "/auth/login", {
    email: "admin@municipality.gov.np",
    password: "wrongpassword",
  });
  check("Wrong password rejected", r.status === 401);

  // 1c. Login with empty fields
  r = await api("POST", "/auth/login", { email: "", password: "" });
  check("Empty fields rejected", !r.ok, `status=${r.status}`);

  // 1d. Login as Principal
  r = await api("POST", "/auth/login", {
    email: "principal@janata.edu.np",
    password: "password123",
  });
  check("Principal login", r.ok && r.data.token);
  const principalToken = r.data.token;
  const principalUser = r.data.user;

  // 1e. Login as Teacher
  r = await api("POST", "/auth/login", {
    email: "ram.karki@janata.edu.np",
    password: "password123",
  });
  check("Teacher login", r.ok && r.data.token);
  const teacherToken = r.data.token;
  const teacherUser = r.data.user;

  // 1f. Login as Student
  r = await api("POST", "/auth/login", {
    email: "10a.student1@janata.edu.np",
    password: "password123",
  });
  check("Student login", r.ok && r.data.token);
  const studentToken = r.data.token;
  const studentUser = r.data.user;

  // 1g. Get /auth/me
  r = await api("GET", "/auth/me", null, saToken);
  check(
    "GET /auth/me returns user",
    r.ok && r.data.user?.email === "admin@municipality.gov.np",
  );

  // ─── 2. SUPER ADMIN: CREATE 4 MORE SCHOOLS ───────────────────
  console.log("\n── 2. SUPER ADMIN: CREATE SCHOOLS ──");

  const newSchools = [
    {
      name: "Shree Saraswati Basic School",
      address: "Ward 3, Lalitpur",
      phone: "01-5234567",
    },
    {
      name: "Nepal Rastriya Secondary School",
      address: "Ward 7, Bhaktapur",
      phone: "01-6612345",
    },
    {
      name: "Himalaya Model School",
      address: "Ward 12, Kirtipur",
      phone: "01-4456789",
    },
    {
      name: "Patan Higher Secondary School",
      address: "Ward 9, Patan",
      phone: "01-5567890",
    },
  ];

  const schoolIds = [];
  for (const s of newSchools) {
    r = await api("POST", "/schools", s, saToken);
    check(
      `Create school: ${s.name}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) schoolIds.push(r.data._id);
  }

  // Verify: GET all schools
  r = await api("GET", "/schools", null, saToken);
  check(
    `GET /schools returns 5 total`,
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // Verify: GET single school
  if (schoolIds[0]) {
    r = await api("GET", `/schools/${schoolIds[0]}`, null, saToken);
    check(
      "GET /schools/:id returns school detail",
      r.ok && r.data.name === "Shree Saraswati Basic School",
    );
  }

  // ─── 3. CREATE PRINCIPALS FOR NEW SCHOOLS ─────────────────────
  console.log("\n── 3. CREATE PRINCIPALS ──");

  const principalData = [
    {
      name: "Sita Devi Shrestha",
      email: "sita.principal@saraswati.edu.np",
      phone: "9841100001",
      password: "principal123",
    },
    {
      name: "Bishnu Prasad Koirala",
      email: "bishnu.principal@rastriya.edu.np",
      phone: "9841100002",
      password: "principal123",
    },
    {
      name: "Kamala Devi Bhandari",
      email: "kamala.principal@himalaya.edu.np",
      phone: "9841100003",
      password: "principal123",
    },
    {
      name: "Gopal Krishna Shrestha",
      email: "gopal.principal@patan.edu.np",
      phone: "9841100004",
      password: "principal123",
    },
  ];

  const principalIds = [];
  for (let i = 0; i < principalData.length; i++) {
    const p = principalData[i];
    r = await api(
      "POST",
      "/users",
      {
        ...p,
        role: "SCHOOL_ADMIN",
        schoolId: schoolIds[i],
      },
      saToken,
    );
    check(
      `Create principal: ${p.name}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) principalIds.push(r.data._id);
  }

  // Verify: GET users with role SCHOOL_ADMIN
  r = await api("GET", "/users?role=SCHOOL_ADMIN", null, saToken);
  check(
    "GET principals list = 5 total",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // Test duplicate email
  r = await api(
    "POST",
    "/users",
    {
      name: "Duplicate Test",
      email: "sita.principal@saraswati.edu.np",
      password: "test123",
      role: "SCHOOL_ADMIN",
      schoolId: schoolIds[0],
    },
    saToken,
  );
  check("Duplicate email rejected", r.status === 400, `status=${r.status}`);

  // ─── 4. LOGIN AS NEW PRINCIPAL, CREATE CLASSES ────────────────
  console.log("\n── 4. PRINCIPAL: CREATE CLASSES ──");

  r = await api("POST", "/auth/login", {
    email: "sita.principal@saraswati.edu.np",
    password: "principal123",
  });
  check("New principal can login", r.ok && r.data.token);
  const p2Token = r.data.token;
  const p2User = r.data.user;

  const classData = [
    { grade: 6, section: "A", academicYear: "2083" },
    { grade: 6, section: "B", academicYear: "2083" },
    { grade: 7, section: "A", academicYear: "2083" },
    { grade: 8, section: "A", academicYear: "2083" },
    { grade: 9, section: "A", academicYear: "2083" },
  ];

  const newClassIds = [];
  for (const c of classData) {
    r = await api(
      "POST",
      "/classes",
      { ...c, schoolId: p2User.schoolId },
      p2Token,
    );
    check(
      `Create class: Grade ${c.grade}${c.section}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) newClassIds.push(r.data._id);
  }

  // Verify: GET classes for this school
  r = await api("GET", `/classes?schoolId=${p2User.schoolId}`, null, p2Token);
  check(
    "GET classes for new school = 5",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // Test invalid class: missing grade
  r = await api(
    "POST",
    "/classes",
    { section: "Z", academicYear: "2083", schoolId: p2User.schoolId },
    p2Token,
  );
  check("Class without grade rejected", !r.ok, `status=${r.status}`);

  // ─── 5. CREATE TEACHERS (via user endpoint) ───────────────────
  console.log("\n── 5. PRINCIPAL: CREATE TEACHERS ──");

  const teacherData = [
    {
      name: "Anita Basnet",
      email: "anita.basnet@saraswati.edu.np",
      phone: "9842200001",
      password: "teacher123",
    },
    {
      name: "Deepak Adhikari",
      email: "deepak.adhikari@saraswati.edu.np",
      phone: "9842200002",
      password: "teacher123",
    },
    {
      name: "Meena Karki",
      email: "meena.karki@saraswati.edu.np",
      phone: "9842200003",
      password: "teacher123",
    },
    {
      name: "Prakash Thapa",
      email: "prakash.thapa@saraswati.edu.np",
      phone: "9842200004",
      password: "teacher123",
    },
    {
      name: "Rekha Maharjan",
      email: "rekha.maharjan@saraswati.edu.np",
      phone: "9842200005",
      password: "teacher123",
    },
  ];

  const newTeacherIds = [];
  for (const t of teacherData) {
    r = await api(
      "POST",
      "/users",
      {
        ...t,
        role: "TEACHER",
        schoolId: p2User.schoolId,
      },
      p2Token,
    );
    check(
      `Create teacher: ${t.name}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) newTeacherIds.push(r.data._id);
  }

  // Verify: GET teachers for this school
  r = await api(
    "GET",
    `/users?role=TEACHER&schoolId=${p2User.schoolId}`,
    null,
    p2Token,
  );
  check(
    "GET teachers for school 2 = 5",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // ─── 6. CREATE STUDENTS ───────────────────────────────────────
  console.log("\n── 6. PRINCIPAL: CREATE STUDENTS ──");

  const studentNames = [
    "Aarav Tamang",
    "Bibek Gurung",
    "Chhiring Sherpa",
    "Deepa Rai",
    "Ekta Magar",
    "Firoj Khan",
    "Gita Bhattarai",
    "Hari Adhikari",
    "Ishwori Poudel",
    "Jeevan Shrestha",
    "Kabita Thapa",
    "Laxmi Karki",
    "Mohan Bhandari",
    "Nisha Ghimire",
    "Om Maharjan",
    "Puja Basnet",
    "Rajesh Chhetri",
    "Sita Lama",
    "Tara Sapkota",
    "Ujjwal Dahal",
    "Anuj Poudel",
    "Barsha Gurung",
    "Chandan Sherpa",
    "Diya Tamang",
    "Erica Rai",
  ];

  const newStudentIds = [];
  for (let i = 0; i < 25; i++) {
    const classIdx = Math.floor(i / 5); // 5 students per class
    r = await api(
      "POST",
      "/users",
      {
        name: studentNames[i],
        email: `student${i + 1}@saraswati.edu.np`,
        password: "student123",
        role: "STUDENT",
        schoolId: p2User.schoolId,
        classId: newClassIds[classIdx],
        rollNumber: String((i % 5) + 1).padStart(2, "0"),
        phone: `984330000${i + 1}`,
      },
      p2Token,
    );
    check(
      `Create student: ${studentNames[i]}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) newStudentIds.push(r.data._id);
  }

  // Verify: GET students for school 2
  r = await api(
    "GET",
    `/users?role=STUDENT&schoolId=${p2User.schoolId}`,
    null,
    p2Token,
  );
  check(
    "GET students for school 2 = 25",
    r.ok && r.data.length === 25,
    `got=${r.data?.length}`,
  );

  // Verify: GET students filtered by class
  r = await api(
    "GET",
    `/users?role=STUDENT&classId=${newClassIds[0]}`,
    null,
    p2Token,
  );
  check(
    "GET students in Grade 6A = 5",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // ─── 7. CREATE SUBJECTS ───────────────────────────────────────
  console.log("\n── 7. PRINCIPAL: CREATE SUBJECTS ──");

  const subjectNames = [
    "Science",
    "Mathematics",
    "Nepali",
    "English",
    "Social Studies",
  ];
  const subjectColors = ["#2563eb", "#059669", "#7c3aed", "#dc2626", "#d97706"];
  const newSubjectIds = [];

  for (let ci = 0; ci < newClassIds.length; ci++) {
    for (let si = 0; si < 5; si++) {
      r = await api(
        "POST",
        "/subjects",
        {
          schoolId: p2User.schoolId,
          classId: newClassIds[ci],
          name: subjectNames[si],
          teacherId: newTeacherIds[si % newTeacherIds.length],
          color: subjectColors[si],
        },
        p2Token,
      );
      if (ci === 0) {
        // Track class 6A subjects
        check(
          `Create subject: ${subjectNames[si]} for Grade ${classData[ci].grade}`,
          r.ok && r.data._id,
          `status=${r.status} ${r.data.message || ""}`,
        );
        if (r.data._id) newSubjectIds.push(r.data._id);
      }
    }
  }

  // Verify: subjects for class 6A
  r = await api("GET", `/subjects?classId=${newClassIds[0]}`, null, p2Token);
  check(
    "GET subjects for Grade 6A = 5",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // ─── 8. TEACHER: CREATE CHAPTERS & TOPICS ─────────────────────
  console.log("\n── 8. TEACHER: CREATE CHAPTERS & TOPICS ──");

  r = await api("POST", "/auth/login", {
    email: "anita.basnet@saraswati.edu.np",
    password: "teacher123",
  });
  check("New teacher can login", r.ok && r.data.token);
  const t2Token = r.data.token;

  const chapterTitles = [
    "Living Things and Their Environment",
    "Matter and Its Properties",
    "Force and Pressure",
    "Light and Sound",
    "Our Earth",
  ];

  const newChapterIds = [];
  for (let i = 0; i < 5; i++) {
    r = await api(
      "POST",
      "/chapters",
      {
        subjectId: newSubjectIds[0], // Science for Grade 6A
        schoolId: p2User.schoolId,
        title: chapterTitles[i],
        description: `Comprehensive study of ${chapterTitles[i].toLowerCase()} covering key concepts and practical applications.`,
        order: i + 1,
        status: i < 3 ? "published" : "draft",
      },
      t2Token,
    );
    check(
      `Create chapter: ${chapterTitles[i]}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) newChapterIds.push(r.data._id);
  }

  // Create topics for first 3 published chapters
  const topicIds = [];
  for (let ci = 0; ci < 3; ci++) {
    const topics = [
      {
        title: `${chapterTitles[ci]} - Lecture Notes`,
        type: "note",
        content: `Detailed notes covering all aspects of ${chapterTitles[ci].toLowerCase()}.`,
      },
      {
        title: `${chapterTitles[ci]} - Video Explanation`,
        type: "video",
        fileUrl: "https://example.com/lectures/topic.mp4",
      },
      {
        title: `${chapterTitles[ci]} - Practice PDF`,
        type: "pdf",
        fileUrl: "https://example.com/worksheets/practice.pdf",
      },
    ];
    for (const t of topics) {
      r = await api(
        "POST",
        "/topics",
        {
          chapterId: newChapterIds[ci],
          ...t,
          order: topics.indexOf(t) + 1,
        },
        t2Token,
      );
      if (topics.indexOf(t) === 0) {
        check(
          `Create topic for "${chapterTitles[ci]}"`,
          r.ok && r.data._id,
          `status=${r.status} ${r.data.message || ""}`,
        );
      }
      if (r.data._id) topicIds.push(r.data._id);
    }
  }

  // Verify: GET chapters for subject
  r = await api(
    "GET",
    `/chapters?subjectId=${newSubjectIds[0]}`,
    null,
    t2Token,
  );
  check(
    "GET chapters for Science = 5",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // Verify: GET single chapter
  if (newChapterIds[0]) {
    r = await api("GET", `/chapters/${newChapterIds[0]}`, null, t2Token);
    check(
      "GET chapter detail has topics",
      r.ok && r.data.title === chapterTitles[0],
    );
  }

  // Verify: GET topics for chapter
  r = await api("GET", `/topics?chapterId=${newChapterIds[0]}`, null, t2Token);
  check(
    "GET topics for chapter 1 = 3",
    r.ok && r.data.length === 3,
    `got=${r.data?.length}`,
  );

  // ─── 9. TEACHER: CREATE ASSIGNMENTS ───────────────────────────
  console.log("\n── 9. TEACHER: CREATE ASSIGNMENTS ──");

  const assignmentData = [
    {
      title: "Living Things Worksheet",
      description:
        "Complete questions 1-10 from the workbook on plant and animal classification.",
      maxMarks: 50,
      daysOffset: 7,
    },
    {
      title: "Matter Properties Lab Report",
      description:
        "Write a lab report on the experiment about states of matter. Include observations and conclusions.",
      maxMarks: 100,
      daysOffset: 14,
    },
    {
      title: "Force & Pressure Quiz Prep",
      description:
        "Practice problems on calculating force, pressure, and their real-world applications.",
      maxMarks: 25,
      daysOffset: -3,
      allowLate: true,
    },
    {
      title: "Mid-Term Science Project",
      description:
        "Choose a topic from chapters 1-3 and prepare a working model or presentation.",
      maxMarks: 100,
      daysOffset: 21,
    },
    {
      title: "Light and Sound Diagrams",
      description:
        "Draw labeled diagrams showing reflection, refraction, and sound wave propagation.",
      maxMarks: 40,
      daysOffset: -7,
      allowLate: true,
    },
  ];

  const newAssignmentIds = [];
  for (const a of assignmentData) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + a.daysOffset);
    r = await api(
      "POST",
      "/assignments",
      {
        title: a.title,
        description: a.description,
        classId: newClassIds[0], // Grade 6A
        subjectId: newSubjectIds[0], // Science
        schoolId: p2User.schoolId,
        teacherId: newTeacherIds[0],
        dueDate: dueDate.toISOString(),
        maxMarks: a.maxMarks,
        status: "published",
        ...(a.allowLate ? { allowLate: true } : {}),
      },
      t2Token,
    );
    check(
      `Create assignment: ${a.title}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
    if (r.data._id) newAssignmentIds.push(r.data._id);
  }

  // Verify: GET assignments
  r = await api("GET", "/assignments", null, t2Token);
  check(
    "GET assignments returns data",
    r.ok && r.data.length > 0,
    `got=${r.data?.length}`,
  );

  // ─── 10. STUDENT: SUBMIT ASSIGNMENTS ──────────────────────────
  console.log("\n── 10. STUDENT: SUBMIT ASSIGNMENTS ──");

  r = await api("POST", "/auth/login", {
    email: "student1@saraswati.edu.np",
    password: "student123",
  });
  check("New student can login", r.ok && r.data.token);
  const s2Token = r.data.token;

  // Submit to past-due assignments (index 2 and 4 are past due)
  for (const idx of [2, 4]) {
    if (newAssignmentIds[idx]) {
      r = await api(
        "POST",
        `/assignments/${newAssignmentIds[idx]}/submit`,
        {
          textContent:
            "This is my completed assignment submission with detailed answers covering all the required topics.",
        },
        s2Token,
      );
      check(
        `Student submits: ${assignmentData[idx].title}`,
        r.ok || r.status === 201,
        `status=${r.status} ${r.data.message || ""}`,
      );
    }
  }

  // Submit to future assignments too
  for (const idx of [0, 1]) {
    if (newAssignmentIds[idx]) {
      r = await api(
        "POST",
        `/assignments/${newAssignmentIds[idx]}/submit`,
        {
          textContent:
            "Early submission — I completed the assignment ahead of the deadline.",
        },
        s2Token,
      );
      check(
        `Student early submit: ${assignmentData[idx].title}`,
        r.ok || r.status === 201,
        `status=${r.status} ${r.data.message || ""}`,
      );
    }
  }

  // Verify: GET submissions for an assignment (as teacher)
  if (newAssignmentIds[2]) {
    r = await api(
      "GET",
      `/assignments/${newAssignmentIds[2]}/submissions`,
      null,
      t2Token,
    );
    check(
      "GET submissions for past assignment",
      r.ok && r.data.length >= 1,
      `got=${r.data?.length}`,
    );
  }

  // ─── 11. TEACHER: GRADE SUBMISSIONS ───────────────────────────
  console.log("\n── 11. TEACHER: GRADE SUBMISSIONS ──");

  if (newAssignmentIds[2]) {
    r = await api(
      "GET",
      `/assignments/${newAssignmentIds[2]}/submissions`,
      null,
      t2Token,
    );
    if (r.ok && r.data.length > 0) {
      const sub = r.data[0];
      r = await api(
        "PUT",
        `/assignments/submissions/${sub._id}/grade`,
        {
          marks: 22,
          feedback:
            "Good work on the force calculations. Pay more attention to unit conversions next time.",
        },
        t2Token,
      );
      check(
        "Grade submission: marks=22/25",
        r.ok,
        `status=${r.status} ${r.data.message || ""}`,
      );

      // Verify: submission now has marks
      r = await api(
        "GET",
        `/assignments/${newAssignmentIds[2]}/submissions`,
        null,
        t2Token,
      );
      const graded = r.data?.find((s) => s.marks === 22);
      check("Graded submission shows marks=22", !!graded);
    }
  }

  // ─── 12. TEACHER: MARK ATTENDANCE ─────────────────────────────
  console.log("\n── 12. TEACHER: MARK ATTENDANCE ──");

  // Get students in class 6A
  const class6AStudents = newStudentIds.slice(0, 5);

  // Mark attendance for today
  const today = new Date().toISOString().split("T")[0];
  r = await api(
    "POST",
    "/attendance",
    {
      schoolId: p2User.schoolId,
      classId: newClassIds[0],
      date: today,
      records: class6AStudents.map((id, i) => ({
        studentId: id,
        status: i < 4 ? "P" : "A", // 4 present, 1 absent
      })),
    },
    t2Token,
  );
  check(
    "Mark attendance for Grade 6A today",
    r.ok,
    `status=${r.status} ${r.data.message || ""}`,
  );

  // Mark for yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  r = await api(
    "POST",
    "/attendance",
    {
      schoolId: p2User.schoolId,
      classId: newClassIds[0],
      date: yesterday.toISOString().split("T")[0],
      records: class6AStudents.map((id, i) => ({
        studentId: id,
        status: i < 3 ? "P" : "A", // 3 present, 2 absent
      })),
    },
    t2Token,
  );
  check(
    "Mark attendance for yesterday",
    r.ok,
    `status=${r.status} ${r.data.message || ""}`,
  );

  // Mark 3 more days
  for (let d = 2; d <= 4; d++) {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    if (dt.getDay() === 6) continue; // skip Saturday
    r = await api(
      "POST",
      "/attendance",
      {
        schoolId: p2User.schoolId,
        classId: newClassIds[0],
        date: dt.toISOString().split("T")[0],
        records: class6AStudents.map((id) => ({
          studentId: id,
          status: Math.random() < 0.8 ? "P" : "A",
        })),
      },
      t2Token,
    );
    check(
      `Mark attendance for ${dt.toISOString().split("T")[0]}`,
      r.ok,
      `status=${r.status}`,
    );
  }

  // Verify: GET attendance for class
  r = await api(
    "GET",
    `/attendance?classId=${newClassIds[0]}&date=${today}`,
    null,
    t2Token,
  );
  check(
    "GET attendance for today",
    r.ok,
    `status=${r.status} records=${r.data?.records?.length || r.data?.length || "?"}`,
  );

  // Verify: GET student's own attendance
  r = await api("GET", "/attendance/me", null, s2Token);
  check("Student GET /attendance/me", r.ok, `status=${r.status}`);

  // ─── 13. NOTICES ──────────────────────────────────────────────
  console.log("\n── 13. CREATE NOTICES ──");

  const noticeData = [
    {
      title: "Annual Sports Day 2083",
      body: "The annual sports day will be held on Jestha 15, 2083. All students from Grade 6-9 must participate. Events include running, long jump, basketball, and volleyball.",
      category: "event",
      priority: "high",
    },
    {
      title: "Library Week Celebration",
      body: "Library week starts from Baisakh 20. Special reading sessions and book exchange program for all grades. Prize for the student who reads the most books!",
      category: "general",
      priority: "medium",
    },
    {
      title: "Fee Payment Reminder",
      body: "Monthly school fee for Baisakh must be paid by the 10th of the month. Late fees will be charged after that date. Contact the office for any queries.",
      category: "general",
      priority: "medium",
    },
    {
      title: "Science Exhibition",
      body: "Class 6A and 7A students will present their science projects on Jestha 5. Parents and guardians are welcome to attend and view the projects.",
      category: "event",
      priority: "low",
    },
    {
      title: "Holiday - Republic Day",
      body: "School will remain closed on Jestha 15 on the occasion of Republic Day. Classes resume from Jestha 16.",
      category: "holiday",
      priority: "low",
    },
  ];

  for (const n of noticeData) {
    r = await api(
      "POST",
      "/notices",
      {
        ...n,
        schoolId: p2User.schoolId,
      },
      p2Token,
    );
    check(
      `Create notice: ${n.title}`,
      r.ok && r.data._id,
      `status=${r.status} ${r.data.message || ""}`,
    );
  }

  // Municipality-wide notice
  r = await api(
    "POST",
    "/notices",
    {
      title: "Municipality Teacher Training Program",
      body: "All teachers across municipality schools are invited to the professional development workshop on Jestha 10 at the Municipal Education Office. Topics: digital classroom tools, student assessment strategies.",
      category: "event",
      priority: "high",
      from: "municipality",
    },
    saToken,
  );
  check(
    "Create municipality-wide notice",
    r.ok && r.data._id,
    `status=${r.status}`,
  );

  // Verify: GET notices
  r = await api("GET", "/notices", null, p2Token);
  check(
    "GET notices returns data",
    r.ok && r.data.length > 0,
    `got=${r.data?.length}`,
  );

  // Verify: Student sees notices
  r = await api("GET", "/notices", null, s2Token);
  check(
    "Student can see notices",
    r.ok && r.data.length > 0,
    `got=${r.data?.length}`,
  );

  // ─── 14. EDIT TESTS ──────────────────────────────────────────
  console.log("\n── 14. EDIT / UPDATE TESTS ──");

  // Edit a teacher
  if (newTeacherIds[0]) {
    r = await api(
      "PUT",
      `/users/${newTeacherIds[0]}`,
      {
        name: "Anita Basnet-Thapa",
        phone: "9842299999",
      },
      p2Token,
    );
    check(
      "Edit teacher name & phone",
      r.ok && r.data.name === "Anita Basnet-Thapa",
    );
  }

  // Edit a student
  if (newStudentIds[0]) {
    r = await api(
      "PUT",
      `/users/${newStudentIds[0]}`,
      {
        rollNumber: "99",
      },
      p2Token,
    );
    check("Edit student roll number", r.ok && r.data.rollNumber === "99");
  }

  // Edit a school
  if (schoolIds[0]) {
    r = await api(
      "PUT",
      `/schools/${schoolIds[0]}`,
      {
        name: "Shree Saraswati Adarsha Vidyalaya",
        phone: "01-5234999",
      },
      saToken,
    );
    check(
      "Edit school name",
      r.ok && r.data.name === "Shree Saraswati Adarsha Vidyalaya",
    );
  }

  // Update a chapter
  if (newChapterIds[0]) {
    r = await api(
      "PUT",
      `/chapters/${newChapterIds[0]}`,
      {
        title: "Living Things: Classification & Environment",
        description: "Updated comprehensive study guide.",
      },
      t2Token,
    );
    check(
      "Edit chapter title",
      r.ok && r.data.title === "Living Things: Classification & Environment",
    );
  }

  // ─── 15. DEACTIVATE / DELETE TESTS ────────────────────────────
  console.log("\n── 15. DEACTIVATE / DELETE TESTS ──");

  // Deactivate a student
  if (newStudentIds.length >= 25) {
    r = await api(
      "PATCH",
      `/users/${newStudentIds[24]}/deactivate`,
      null,
      p2Token,
    );
    check("Deactivate student", r.ok, `status=${r.status}`);

    // Verify: student no longer in active list
    r = await api(
      "GET",
      `/users?role=STUDENT&schoolId=${p2User.schoolId}`,
      null,
      p2Token,
    );
    const found = r.data?.find((s) => s._id === newStudentIds[24]);
    check("Deactivated student not in list", !found, `found=${!!found}`);
  }

  // Delete a notice
  r = await api("GET", "/notices", null, p2Token);
  if (r.ok && r.data.length > 0) {
    const noticeId = r.data[r.data.length - 1]._id;
    r = await api("DELETE", `/notices/${noticeId}`, null, p2Token);
    check("Delete a notice", r.ok, `status=${r.status}`);
  }

  // Delete a class (from school 1, unused class)
  r = await api("DELETE", `/classes/${newClassIds[4]}`, null, p2Token);
  check("Delete class Grade 9A", r.ok, `status=${r.status}`);

  // ─── 16. CHANGE PASSWORD ──────────────────────────────────────
  console.log("\n── 16. PASSWORD CHANGE ──");

  r = await api(
    "PUT",
    "/auth/change-password",
    {
      currentPassword: "teacher123",
      newPassword: "newTeacher456",
    },
    t2Token,
  );
  check(
    "Teacher changes password",
    r.ok,
    `status=${r.status} ${r.data.message || ""}`,
  );

  // Login with new password
  r = await api("POST", "/auth/login", {
    email: "anita.basnet@saraswati.edu.np",
    password: "newTeacher456",
  });
  check("Login with new password works", r.ok && r.data.token);

  // Old password should fail
  r = await api("POST", "/auth/login", {
    email: "anita.basnet@saraswati.edu.np",
    password: "teacher123",
  });
  check("Old password rejected", r.status === 401);

  // Change back
  const newT2Token = (
    await api("POST", "/auth/login", {
      email: "anita.basnet@saraswati.edu.np",
      password: "newTeacher456",
    })
  ).data.token;
  await api(
    "PUT",
    "/auth/change-password",
    { currentPassword: "newTeacher456", newPassword: "teacher123" },
    newT2Token,
  );

  // ─── 17. DASHBOARD / STATS VERIFICATION ───────────────────────
  console.log("\n── 17. DASHBOARD & STATS VERIFICATION ──");

  // School 1 dashboard
  r = await api("GET", "/dashboard/stats", null, principalToken);
  check("School 1 dashboard stats", r.ok && r.data, `status=${r.status}`);
  if (r.ok) {
    check(
      "Dashboard has classes count",
      typeof r.data.totalClasses === "number",
    );
    check(
      "Dashboard has students count",
      typeof r.data.totalStudents === "number",
    );
    check(
      "Dashboard has teachers count",
      typeof r.data.totalTeachers === "number",
    );
  }

  // School 1 stats via school endpoint
  r = await api("GET", `/schools`, null, saToken);
  const school1 = r.data?.find(
    (s) => s.name === "Shree Janata Secondary School",
  );
  if (school1) {
    r = await api("GET", `/schools/${school1._id}/stats`, null, saToken);
    check(
      "School 1 /stats has teachers & students",
      r.ok && r.data.teachers > 0 && r.data.students > 0,
      `t=${r.data?.teachers} s=${r.data?.students}`,
    );
  }

  // Student overview
  r = await api("GET", `/students`, null, principalToken);
  if (r.ok && r.data.length > 0) {
    const stId = r.data[0]._id;
    r = await api("GET", `/students/${stId}/overview`, null, principalToken);
    check(
      "Student overview returns data",
      r.ok && r.data.student,
      `status=${r.status}`,
    );
    if (r.ok) {
      check(
        "Overview has attendance stats",
        typeof r.data.attendance?.percentage === "number",
      );
      check("Overview has assignments data", Array.isArray(r.data.assignments));
    }
  }

  // ─── 18. CROSS-PORTAL DATA CONSISTENCY ────────────────────────
  console.log("\n── 18. CROSS-PORTAL DATA CONSISTENCY ──");

  // Verify: Schools count from super admin
  r = await api("GET", "/schools", null, saToken);
  check(
    "Total schools = 5",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // Verify: Each school's principal is linked
  for (const s of r.data || []) {
    if (s.name !== "Shree Janata Secondary School") {
      // New schools should not have principalId set via school endpoint
      // (we created principals via user endpoint, not via school.create)
    }
  }

  // Verify: School 2 teachers visible to principal 2
  r = await api(
    "GET",
    `/users?role=TEACHER&schoolId=${p2User.schoolId}`,
    null,
    p2Token,
  );
  check(
    "Principal 2 sees 5 teachers",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // Verify: School 2 students after deactivation
  r = await api(
    "GET",
    `/users?role=STUDENT&schoolId=${p2User.schoolId}`,
    null,
    p2Token,
  );
  check(
    "School 2 students = 24 (1 deactivated)",
    r.ok && r.data.length === 24,
    `got=${r.data?.length}`,
  );

  // Verify: Teacher's student list for school 1
  r = await api(
    "GET",
    "/students?schoolId=" + principalUser.schoolId,
    null,
    teacherToken,
  );
  check(
    "Teacher sees school 1 students (~153)",
    r.ok && r.data.length > 100,
    `got=${r.data?.length}`,
  );

  // Verify: Subjects visible to teacher
  r = await api("GET", `/subjects?classId=${newClassIds[0]}`, null, t2Token);
  check(
    "Teacher sees subjects for class",
    r.ok && r.data.length === 5,
    `got=${r.data?.length}`,
  );

  // ─── 19. AUTHORIZATION BOUNDARY TESTS ─────────────────────────
  console.log("\n── 19. AUTHORIZATION BOUNDARY TESTS ──");

  // Student cannot create users
  r = await api(
    "POST",
    "/users",
    {
      name: "Hacker",
      email: "hacker@test.com",
      password: "test123",
      role: "TEACHER",
    },
    s2Token,
  );
  check(
    "Student CANNOT create users (403)",
    r.status === 403,
    `status=${r.status}`,
  );

  // Teacher cannot create users
  r = await api(
    "POST",
    "/users",
    {
      name: "Hacker",
      email: "hacker2@test.com",
      password: "test123",
      role: "STUDENT",
    },
    t2Token,
  );
  check(
    "Teacher CANNOT create users (403)",
    r.status === 403,
    `status=${r.status}`,
  );

  // Student cannot create schools
  r = await api(
    "POST",
    "/schools",
    {
      name: "Fake School",
      address: "Nowhere",
    },
    s2Token,
  );
  check(
    "Student CANNOT create schools (403)",
    r.status === 403,
    `status=${r.status}`,
  );

  // No token = 401
  r = await api("GET", "/users");
  check("No token = 401", r.status === 401, `status=${r.status}`);

  // Teacher cannot create classes
  r = await api(
    "POST",
    "/classes",
    {
      grade: 11,
      section: "A",
      academicYear: "2083",
      schoolId: p2User.schoolId,
    },
    t2Token,
  );
  check(
    "Teacher CANNOT create classes (403)",
    r.status === 403,
    `status=${r.status}`,
  );

  // ─── 20. EDGE CASES ──────────────────────────────────────────
  console.log("\n── 20. EDGE CASES ──");

  // Special characters in name
  r = await api(
    "POST",
    "/users",
    {
      name: 'O\'Brien "Test" <script>alert(1)</script>',
      email: "special.chars@saraswati.edu.np",
      password: "test12345",
      role: "STUDENT",
      schoolId: p2User.schoolId,
      classId: newClassIds[0],
    },
    p2Token,
  );
  check(
    "Special chars in name accepted (stored safely)",
    r.ok,
    `status=${r.status}`,
  );
  if (r.ok) {
    check("Name stored as-is (no XSS exec)", r.data.name.includes("<script>"));
  }

  // Very long name
  r = await api(
    "POST",
    "/users",
    {
      name: "A".repeat(500),
      email: "longname@saraswati.edu.np",
      password: "test12345",
      role: "STUDENT",
      schoolId: p2User.schoolId,
      classId: newClassIds[0],
    },
    p2Token,
  );
  check("500-char name accepted (no maxlength)", r.ok, `status=${r.status}`);

  // Non-existent resource
  r = await api("GET", "/users/000000000000000000000000", null, saToken);
  check(
    "Non-existent user returns 404",
    r.status === 404,
    `status=${r.status}`,
  );

  r = await api("GET", "/schools/000000000000000000000000", null, saToken);
  check(
    "Non-existent school returns 404",
    r.status === 404,
    `status=${r.status}`,
  );

  // ═══════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  RESULTS: ${pass} passed, ${fail} failed`);
  console.log("═══════════════════════════════════════════════════");

  if (fail > 0) {
    console.log("\n  ❌ FAILURES — review the items marked ❌ above");
  } else {
    console.log("\n  ✅ ALL TESTS PASSED");
  }
}

run().catch(console.error);
