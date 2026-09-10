

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/resume";


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, fileName);
  }
});

module.exports = multer({ storage });


