
// // const router = express.Router();

// // const authMiddleware = require("../middleware/auth");
// // const applicationLimitMiddleware = require("../middleware/applicationLimitMiddleware");
// // const upload = require("../middleware/upload");

// // const { applyForInternship,deleteApplication,updateApplicationStatus,} = require("../controllers/applicationController");
// // const isAdmin = require("../middleware/adminAuth");
// // // APPLY ROUTE (FINAL CLEAN)
// // router.post(
// //   "/apply/:id",
// //   authMiddleware,
// //   upload.single("resumeFile"),
// //   applicationLimitMiddleware,
// //   applyForInternship
// // );
// // router.delete("/:id", authMiddleware, deleteApplication);
// // router.put("/status/:id", authMiddleware, updateApplicationStatus);
// // router.delete("/:id", authMiddleware, isAdmin, deleteApplication);
// // module.exports = router;


// const express = require("express");
// const router = express.Router();

// // Middlewares Import
// const authMiddleware = require("../middleware/auth");
// const applicationLimitMiddleware = require("../middleware/applicationLimitMiddleware");
// const upload = require("../middleware/upload");
// const isAdmin = require("../middleware/adminAuth"); // ✅ Admin auth check

// // Controllers Import
// const { 
//   applyForInternship, 
//   deleteApplication, 
//   updateApplicationStatus 
// } = require("../controllers/applicationController");

// // 🟢 1. APPLY ROUTE (For Normal Users/Students)
// router.post(
//   "/apply/:id",
//   authMiddleware,
//   upload.single("resumeFile"),
//   applicationLimitMiddleware,
//   applyForInternship
// );

// // 🟡 2. STATUS UPDATE ROUTE (Only For Admins)
// // Shortlist, Accept, Reject karne ke liye isAdmin lagana zaroori hai
// router.put(
//   "/status/:id", 
//   authMiddleware, 
//   isAdmin, 
//   updateApplicationStatus
// );

// // 🔴 3. DELETE APPLICATION ROUTE (Only For Admins)
// // Duplicate route hata kar single securely isAdmin ke sath chain kiya hai
// router.delete(
//   "/:id", 
//   authMiddleware, 
//   isAdmin, 
//   deleteApplication
// );

// module.exports = router;

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");   

const router = express.Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/adminAuth");

const {
  applyInternship,
  checkApplied,
  myApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

/* ═══════ MULTER ═══════ */
const uploadDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
     
      `resume-${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalname).toLowerCase()}`
    ),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt = path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isPdfMime && isPdfExt) return cb(null, true);
    return cb(new Error("Only PDF files are allowed"));
  },
});

/* multer error → JSON response */
const uploadResume = (req, res, next) => {
  upload.single("resumeFile")(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large — max 5 MB allowed"
          : err.message || "File upload failed";
      return res.status(400).json({ success: false, message: msg });
    }
    next();
  });
};

/* ═══════ USER ROUTES ═══════ */
router.post("/apply/:id", auth, uploadResume, applyInternship);
router.get("/check/:id", auth, checkApplied);
router.get("/my", auth, myApplications);

/* ═══════ ADMIN ROUTES ═══════ */
router.put("/status/:id", auth, isAdmin, updateApplicationStatus);
router.delete("/:id", auth, isAdmin, deleteApplication);

module.exports = router;