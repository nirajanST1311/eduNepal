const router = require("express").Router();
const c = require("../controllers/notice.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", c.getAll);
router.post("/", authorize("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"), c.create);
router.patch(
  "/:id",
  authorize("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
  c.update,
);
router.delete(
  "/:id",
  authorize("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"),
  c.remove,
);

module.exports = router;
