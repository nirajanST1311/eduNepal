const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const dashboard = require("../controllers/dashboard.controller");

// Public — no auth
router.get("/public-stats", dashboard.getPublicStats);

router.get("/stats", protect, authorize("SCHOOL_ADMIN"), dashboard.getStats);
router.get(
  "/superadmin",
  protect,
  authorize("SUPER_ADMIN"),
  dashboard.getSuperadminStats,
);
router.get(
  "/superadmin/analytics",
  protect,
  authorize("SUPER_ADMIN"),
  dashboard.getSuperadminAnalytics,
);

module.exports = router;
