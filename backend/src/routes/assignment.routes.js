const router = require("express").Router();
const c = require("../controllers/assignment.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", c.getAll);
router.get("/:id", c.getById);
router.post("/", authorize("TEACHER"), c.create);
router.put("/:id", authorize("TEACHER"), c.update);
router.delete("/:id", authorize("TEACHER"), c.deleteAssignment);
router.get("/:id/submissions", authorize("TEACHER"), c.getSubmissions);
router.post("/:id/submit", authorize("STUDENT"), c.submit);
router.put("/submissions/:id/grade", authorize("TEACHER"), c.grade);

module.exports = router;
