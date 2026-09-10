

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const AppliedInternship = require("../models/AppliedInternship"); 
const Internship = require("../models/Internship");
const Payment = require("../models/Payment");

const {
  register,
  login,
  getProfile,
  verifyLoginOtp,
  deleteLoginHistory,
} = require("../controllers/authController");

const { forgotPassword } = require("../controllers/otpController.js");


const  authMiddleware  = require("../middleware/auth.js");
const isAdmin = require("../middleware/adminAuth");
const { googleLogin } = require("../controllers/googleAuthController");
// ==================== PUBLIC ROUTES ====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // JWT me id store hai
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const appliedInternships = await AppliedInternship.find({
      user: req.user.id,
    })
      .populate({
        path: "internship",
      })
      .populate({
        path: "resume",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
      appliedInternships,
    });

  } catch (error) {
    console.error("❌ Error in /me route:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/forgot-password", forgotPassword);

// ==================== PROTECTED ROUTES ====================
router.get("/profile", authMiddleware, getProfile);
router.delete("/login-history/:id", authMiddleware, deleteLoginHistory);


router.get("/admin/analytics", authMiddleware, isAdmin, async (req, res) => {
  try {
    const allPayments = await Payment.find();
    console.log("--- DEBUG START ---");
    console.log("Total Documents in Payment Collection:", allPayments.length);
    if (allPayments.length > 0) {
        console.log("Sample Data:", allPayments[0]);
    }
    console.log("--- DEBUG END ---");
    
  
    const [totalUsers, totalPosts, totalAdmins, activeInternships, paymentStatsArray] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Internship.countDocuments(),
      Payment.aggregate([
        {
          
          $group: {
            
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalPayments: { $sum: 1 },
            subscriptionCount: { $sum: { $cond: [{ $eq: ["$type", "subscription"] }, 1, 0] } },
            resumeCount: { 
              $sum: { 
                $cond: [
                  { $or: [{ $eq: ["$type", "premium_resume"] }, { $eq: ["$planName", "premium_resume"] }] }, 1, 0
                ] 
              } 
            },
            bronzeCount: { $sum: { $cond: [{ $eq: ["$planName", "bronze"] }, 1, 0] } },
            silverCount: { $sum: { $cond: [{ $eq: ["$planName", "silver"] }, 1, 0] } },
            goldCount: { $sum: { $cond: [{ $eq: ["$planName", "gold"] }, 1, 0] } }
            
          }
        }
      ])
    ]);

    // 2. Aggregate result ko extract karein
    const stats = paymentStatsArray[0] || { 
      totalRevenue: 0, totalPayments: 0, subscriptionCount: 0, 
      resumeCount: 0, bronzeCount: 0, silverCount: 0, goldCount: 0 
    };
 

    // 3. Response bhejein
    res.status(200).json({
      success: true,
      summary: {
        totalApplications: totalUsers,
        activeJobs: totalPosts,
        activeInternships,
        totalAdmins,
        totalPayments: stats.totalPayments,
        totalRevenue: stats.totalRevenue,
        subscriptionPayments: stats.subscriptionCount,
        premiumResumePayments: stats.resumeCount,
        bronzeSales: stats.bronzeCount,
        silverSales: stats.silverCount,
        goldSales: stats.goldCount
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/users", authMiddleware, isAdmin, async (req, res) => {
  try {
   
    const users = await User.find({}, "name email role createdAt").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.delete("/admin/user/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
   
    if (req.params.id === String(req.user.id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }
    const target = await User.findById(req.params.id).select("role");
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

   
    if (target.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete another admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User profile deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/applications", authMiddleware, isAdmin, async (req, res) => {
  try {
    const applications = await AppliedInternship.find()
      .populate({
        path: "user",
        select: "name email profileImage"
      })
      .populate({
        path: "internship",
        select: "title company stipend"
      })
      .populate({
        path: "resume"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 2. UPDATE APPLICATION STATUS (Accept / Reject / Shortlist)
router.put("/admin/application-status/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // Expecting "Accepted", "Rejected", or "Shortlisted"
    
    if (!["Shortlisted", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status state" });
    }

    const updatedApp = await AppliedInternship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `Application marked as ${status} successfully!`,
      updatedApp 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;