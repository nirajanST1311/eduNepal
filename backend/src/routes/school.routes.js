const router = require("express").Router();
const c = require("../controllers/school.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", authorize("SUPER_ADMIN"), c.getAll);
router.get("/:id", c.getById);
router.get("/:id/stats", c.getStats);
router.post("/", authorize("SUPER_ADMIN"), c.create);
router.put("/:id", authorize("SUPER_ADMIN"), c.update);

module.exports = router;
