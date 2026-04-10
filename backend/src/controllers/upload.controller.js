const { uploadToCloudinary } = require("../utils/cloudinary");

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });
  const result = await uploadToCloudinary(req.file.buffer, "smgs");
  res.json({ url: result.secure_url, publicId: result.public_id });
};
