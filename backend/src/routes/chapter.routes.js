const router = require("express").Router();
const c = require("../controllers/chapter.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/", c.getAll);
router.get("/:id", c.getById);
router.post("/", authorize("TEACHER"), c.create);
router.put("/:id", authorize("TEACHER"), c.update);
router.delete("/:id", authorize("TEACHER"), c.remove);

module.exports = router;
