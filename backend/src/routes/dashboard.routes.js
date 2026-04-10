const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const dashboard = require("../controllers/dashboard.controller");

router.get("/stats", protect, authorize("SCHOOL_ADMIN"), dashboard.getStats);

module.exports = router;
