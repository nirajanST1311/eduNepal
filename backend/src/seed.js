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

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    School.deleteMany(),
    Class.deleteMany(),
    Subject.deleteMany(),
  ]);

  // Super admin
  const superAdmin = await User.create({
    name: "Municipality Admin",
    email: "admin@municipality.gov.np",
    password: "password123",
    role: "SUPER_ADMIN",
  });

  // School
  const school = await School.create({
    municipalityId: superAdmin._id,
    name: "Shree Janata Secondary School",
    address: "Ward 5, Kathmandu",
    phone: "01-4123456",
  });

  // Principal
  const principal = await User.create({
    name: "Ram Bahadur Thapa",
    email: "principal@janata.edu.np",
    password: "password123",
    role: "SCHOOL_ADMIN",
    schoolId: school._id,
  });

  school.principalId = principal._id;
  await school.save();

  // Classes
  const class10A = await Class.create({
    schoolId: school._id,
    grade: 10,
    section: "A",
    academicYear: "2083",
  });
  const class9A = await Class.create({
    schoolId: school._id,
    grade: 9,
    section: "A",
    academicYear: "2083",
  });

  // Teacher
  const teacher = await User.create({
    name: "Sita Sharma",
    email: "teacher@janata.edu.np",
    password: "password123",
    role: "TEACHER",
    schoolId: school._id,
    phone: "9841234567",
  });

  // Subjects
  const science10 = await Subject.create({
    schoolId: school._id,
    classId: class10A._id,
    name: "Science",
    teacherId: teacher._id,
    color: "#2563eb",
  });
  const math10 = await Subject.create({
    schoolId: school._id,
    classId: class10A._id,
    name: "Mathematics",
    teacherId: teacher._id,
    color: "#059669",
  });
  const english10 = await Subject.create({
    schoolId: school._id,
    classId: class10A._id,
    name: "English",
    color: "#d97706",
  });
  const nepali10 = await Subject.create({
    schoolId: school._id,
    classId: class10A._id,
    name: "Nepali",
    color: "#7c3aed",
  });

  teacher.subjectIds = [science10._id, math10._id];
  await teacher.save();

  // Students
  const studentNames = [
    "Aarav Poudel",
    "Bibek Gurung",
    "Chhiring Sherpa",
    "Deepa Tamang",
    "Ekta Rai",
    "Firoj Khan",
    "Gita Bhattarai",
    "Hari Adhikari",
    "Ishwori Magar",
    "Jeevan Shrestha",
  ];

  for (let i = 0; i < studentNames.length; i++) {
    await User.create({
      name: studentNames[i],
      email: `student${i + 1}@janata.edu.np`,
      password: "password123",
      role: "STUDENT",
      schoolId: school._id,
      classId: class10A._id,
      rollNumber: String(i + 1).padStart(2, "0"),
    });
  }

  console.log("\nSeed completed!");
  console.log("Super Admin: admin@municipality.gov.np / password123");
  console.log("Principal:   principal@janata.edu.np / password123");
  console.log("Teacher:     teacher@janata.edu.np / password123");
  console.log("Student:     student1@janata.edu.np / password123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
