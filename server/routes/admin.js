const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Internship = require("../models/Internship");
const Application = require("../models/Application");

// Security middlewares
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/adminAuth");

// Status update + email wala existing controller
const {
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

// =====================================================
// Helper: Old absolute PDF path → public /uploads path
// =====================================================
const getPublicPdfPath = (filePath = "") => {
  if (!filePath) return "";

  const normalizedPath = String(filePath).replace(/\\/g, "/");


  const uploadsIndex = normalizedPath.lastIndexOf("/uploads/");

  if (uploadsIndex !== -1) {
    return normalizedPath.slice(uploadsIndex);
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `/${normalizedPath}`;
  }

  return normalizedPath;
};

// =====================================================
// ADMIN: CREATE INTERNSHIP
// =====================================================
router.post("/internship", auth, isAdmin, async (req, res) => {
  try {
    const newInternship = new Internship(req.body);

    await newInternship.save();

    return res.status(201).json({
      success: true,
      message: "Internship posted successfully!",
      data: newInternship,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// ADMIN: GET ALL APPLICATIONS
// New Application model se fetch hoga
// =====================================================
router.get("/applications", auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};

  
    if (status && status !== "all") {
      if (status === "Pending") {
        query.status = { $in: ["Pending", "Applied"] };
      } else {
        query.status = status;
      }
    }

    const applications = await Application.find(query)
      .populate({
        path: "userId",
        select: "name email profileImage",
      })
      .populate({
        path: "internshipId",
        select:
          "title companyName companyLogo location stipend deadline category internshipType",
      })
      .sort({ createdAt: -1 })
      .lean();

   
    const formattedApplications = applications.map((app) => {
      const publicPdfPath = getPublicPdfPath(app.pdfPath);

      return {
        ...app,

        // Admin UI compatibility
        user: app.userId,
        internship: app.internshipId,

        // Resume compatibility
        resumePath: publicPdfPath,
        pdfPath: publicPdfPath,

        // Date compatibility
        appliedAt: app.createdAt,

        // Old "Applied" application ko Pending display karenge
        status: app.status === "Applied" ? "Pending" : app.status,
      };
    });

    return res.status(200).json({
      success: true,
      applications: formattedApplications,
      total: formattedApplications.length,
    });
  } catch (err) {
    console.error("ADMIN APPLICATION FETCH ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


router.put(
  "/applications/:id",
  auth,
  isAdmin,
  updateApplicationStatus
);


router.delete(
  "/applications/:id",
  auth,
  isAdmin,
  deleteApplication
);


router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// ADMIN: DELETE USER
// =====================================================
router.delete("/users/:id", auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User account removed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;