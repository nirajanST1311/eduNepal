const router = require("express").Router();
const c = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("SUPER_ADMIN", "SCHOOL_ADMIN"), c.getAll);
router.get("/:id", authorize("SUPER_ADMIN", "SCHOOL_ADMIN"), c.getById);
router.post("/", authorize("TEACHER", "SUPER_ADMIN", "SCHOOL_ADMIN"), c.create);
router.put("/:id", authorize("SUPER_ADMIN", "SCHOOL_ADMIN"), c.update);
router.patch(
  "/:id/deactivate",
  authorize("SUPER_ADMIN", "SCHOOL_ADMIN"),
  c.deactivate,
);
router.patch(
  "/:id/reset-password",
  authorize("SUPER_ADMIN", "SCHOOL_ADMIN"),
  c.resetPassword,
);

module.exports = router;
