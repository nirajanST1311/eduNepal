const router = require("express").Router();
const c = require("../controllers/class.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", c.getAll);
router.post("/", authorize("SCHOOL_ADMIN"), c.create);
router.put("/:id", authorize("SCHOOL_ADMIN"), c.update);
router.delete("/:id", authorize("SCHOOL_ADMIN"), c.remove);

module.exports = router;
