const router = require("express").Router();
const multer = require("multer");
const c = require("../controllers/bulkUpload.controller");
const { protect, authorize } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.match(/\.(xlsx|xls)$/i)
    ) {
      return cb(null, true);
    }
    cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
  },
});

router.use(protect, authorize("SCHOOL_ADMIN"));

// Sample downloads
router.get("/sample/teachers", c.teacherSample);
router.get("/sample/students", c.studentSample);

// Bulk uploads
router.post("/teachers", upload.single("file"), c.bulkUploadTeachers);
router.post("/students", upload.single("file"), c.bulkUploadStudents);

module.exports = router;
