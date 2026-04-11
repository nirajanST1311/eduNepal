const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      /jpeg|jpg|png|gif|webp|avif|pdf|mp4|mp3|webm|doc|docx|ppt|pptx/;
    const ext = allowed.test(file.originalname.toLowerCase().split(".").pop());
    const mime = /image\/|video\/|audio\/|application\/(pdf|msword|vnd\.)/.test(
      file.mimetype,
    );
    if (ext || mime) return cb(null, true);
    cb(new Error("File type not allowed"));
  },
});

module.exports = upload;
