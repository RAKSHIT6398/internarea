const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth");
const {
  uploadMedia,
  removeProfilePhoto,
  uploadProfilePhoto,
} = require("../controllers/uploadController");

const storage = multer.memoryStorage();


const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only images (jpg/png/webp/gif) or videos (mp4/webm) allowed")),
});

router.post("/media", auth, upload.single("media"), uploadMedia);
router.put("/remove-profile-photo", auth, removeProfilePhoto);
router.put("/upload-profile-photo", auth, upload.single("profileImage"), uploadProfilePhoto);

module.exports = router;