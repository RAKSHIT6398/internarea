

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/adminAuth");

const {
  getAllInternships,
  getFilterMeta,
  getInternshipById,
  createInternship,
  updateInternship,
  toggleInternship,
  deleteInternship,
  getAllForAdmin,
  migrateOldPosts,
} = require("../controllers/internshipController");

/* ═══════ PUBLIC ═══════ */
router.get("/", getAllInternships);
router.get("/filters/meta", getFilterMeta);

/* ═══════ ADMIN  (⚠️ /:id se PEHLE) ═══════ */
router.get("/admin/all", auth, isAdmin, getAllForAdmin);
router.post("/admin/migrate", auth, isAdmin, migrateOldPosts);

router.post("/", auth, isAdmin, createInternship);
router.put("/:id", auth, isAdmin, updateInternship);
router.patch("/:id/toggle", auth, isAdmin, toggleInternship);
router.delete("/:id", auth, isAdmin, deleteInternship);

/* ═══════ PUBLIC SINGLE (SABSE LAST) ═══════ */
router.get("/:id", getInternshipById);

module.exports = router;