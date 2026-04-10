const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const dashboard = require("../controllers/dashboard.controller");

router.get("/stats", protect, authorize("SCHOOL_ADMIN"), dashboard.getStats);
router.get(
  "/superadmin",
  protect,
  authorize("SUPER_ADMIN"),
  dashboard.getSuperadminStats,
);

module.exports = router;
