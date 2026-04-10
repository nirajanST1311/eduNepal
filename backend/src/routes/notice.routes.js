const router = require("express").Router();
const c = require("../controllers/notice.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", c.getAll);
router.post("/", authorize("SCHOOL_ADMIN", "SUPER_ADMIN"), c.create);
router.delete("/:id", authorize("SCHOOL_ADMIN", "SUPER_ADMIN"), c.remove);

module.exports = router;
