const router = require("express").Router();
const {
  login,
  me,
  changePassword,
  updateProfile,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/login", login);
router.get("/me", protect, me);
router.put("/change-password", protect, changePassword);
router.patch("/profile", protect, updateProfile);
router.post(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  async (req, res) => {
    const { uploadToCloudinary } = require("../utils/cloudinary");
    const User = require("../models/User");
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const result = await uploadToCloudinary(
      req.file.buffer,
      "avatars",
      "image",
    );
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true },
    );
    res.json({ avatar: user.avatar });
  },
);

module.exports = router;
