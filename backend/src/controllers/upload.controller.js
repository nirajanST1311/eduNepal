const { uploadToCloudinary } = require("../utils/cloudinary");

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });
  const mime = req.file.mimetype;
  let resourceType = "image";
  if (mime === "application/pdf" || mime.startsWith("text/")) {
    resourceType = "raw";
  } else if (mime.startsWith("video/") || mime.startsWith("audio/")) {
    resourceType = "video";
  } else if (!mime.startsWith("image/")) {
    resourceType = "raw";
  }
  const result = await uploadToCloudinary(
    req.file.buffer,
    "smgs",
    resourceType,
  );
  res.json({ url: result.secure_url, publicId: result.public_id });
};
