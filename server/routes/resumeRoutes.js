const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const auth = require("../middleware/auth");

const {
  createResume,
  getMyResume,
  getMyResumeStatus,
} = require("../controllers/resumeController");

/* ═══════ MULTER ═══════ */
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      // ✅ crypto random — resume/profile files guess-proof
      `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalname).toLowerCase()}`
    ),
});

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME.includes(file.mimetype) && ALLOWED_EXT.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error("Only PDF or image files (jpg/png/webp) are allowed"));
  },
});

/* ═══════ ROUTES ═══════ */
router.post("/create", auth, upload.single("resumeFile"), createResume);
router.get("/my-resume", auth, getMyResume);
router.get("/my-status", auth, getMyResumeStatus);


module.exports = router;
