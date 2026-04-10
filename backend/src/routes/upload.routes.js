const router = require("express").Router();
const { upload: uploadFile } = require("../controllers/upload.controller");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/", protect, upload.single("file"), uploadFile);

module.exports = router;
