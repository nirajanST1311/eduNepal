const router = require("express").Router();
const c = require("../controllers/attendance.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.post("/", authorize("TEACHER"), c.mark);
router.get("/", c.getByClass);
router.get("/student/:studentId", c.getStudentAttendance);
router.get("/me", authorize("STUDENT"), c.getStudentAttendance);

module.exports = router;
