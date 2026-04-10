const router = require("express").Router();
const c = require("../controllers/student.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"), c.getAll);
router.get(
  "/:id/overview",
  authorize("TEACHER", "SCHOOL_ADMIN"),
  c.getOverview,
);
router.post("/:id/notes", authorize("TEACHER"), c.addNote);

module.exports = router;
