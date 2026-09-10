const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const Application = require("../models/Application");
const Internship = require("../models/Internship");
const User = require("../models/User");

const PLAN_LIMIT = { free: 1, bronze: 3, silver: 5, gold: Infinity };
const getUid = (req) => req.user.id || req.user._id || req.user.userId;

/* ══════════ APPLY (premium ya manual PDF) ══════════ */
exports.applyInternship = async (req, res) => {
  const cleanupFile = () => {
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
  };

  try {
    const userId = getUid(req);
    const internshipId = req.params.id;

    /* 1️⃣ Internship valid? */
    const internship = await Internship.findById(internshipId);

    // 🐛 FIXED: purane docs me isActive undefined hota hai
    if (!internship || internship.isActive === false) {
      cleanupFile();
      return res.status(404).json({ success: false, message: "Internship not available." });
    }
    if (internship.deadline && new Date(internship.deadline) < new Date()) {
      cleanupFile();
      return res.status(400).json({ success: false, message: "Application deadline has passed ⏰" });
    }

    /* 2️⃣ Duplicate? */
    const already = await Application.findOne({ userId, internshipId });
    if (already) {
      cleanupFile();
      return res.status(409).json({
        success: false,
        code: "ALREADY_APPLIED",
        message: "You have already applied here ✅",
      });
    }

    /* 3️⃣ Plan limit (+ 🔄 lazy monthly reset) */
    const user = await User.findById(userId);

    if (!user) {
      cleanupFile();
      return res.status(401).json({ success: false, message: "User not found" });
    }

    /* ✅ NEW — month badalte hi count auto-reset (cron ki zaroorat nahi)
       Reference: paid user ka subscriptionStartDate, warna last activity */
    const now = new Date();
    const refDate = user.subscriptionStartDate || user.updatedAt || user.createdAt;
    if (
      refDate &&
      (now.getMonth() !== new Date(refDate).getMonth() ||
        now.getFullYear() !== new Date(refDate).getFullYear())
    ) {
      user.monthlyApplicationsCount = 0;
      await user.save();
    }

    const plan = (user.subscription || "free").toLowerCase();
    const limit = user.allowedApplications || PLAN_LIMIT[plan] || 1;
    const used = user.monthlyApplicationsCount || 0;

    if (limit !== Infinity && used >= limit) {
      cleanupFile();
      return res.status(403).json({
        success: false,
        code: "LIMIT_REACHED",
        message: `Your ${plan.toUpperCase()} plan allows only ${limit} application(s) per month. Upgrade to continue 🚀`,
      });
    }

    /* 4️⃣ Screening */
    let screening = {};
    try {
      screening = req.body.screening
        ? typeof req.body.screening === "string"
          ? JSON.parse(req.body.screening)
          : req.body.screening
        : {};
    } catch (_) { screening = {}; }

    if (!screening.agreedToTerms) {
      cleanupFile();
      return res.status(400).json({ success: false, message: "Please accept the declaration before applying." });
    }
    if (screening.readyToJoinImmediately === undefined || screening.readyToJoinImmediately === null) {
      cleanupFile();
      return res.status(400).json({ success: false, message: "Please answer: Are you ready to join immediately?" });
    }

    /* 5️⃣ RESUME — 2 OPTIONS */
    const usePremium = req.body.usePremium === "true" || req.body.usePremium === true;
    let isPremium = false, resumeSnapshot = null, pdfPath = "";

    if (usePremium) {
      /* ── OPTION 1: Premium ATS Resume (₹50) ── */
      const Resume = require("../models/Resume");
      const resumeDoc = await Resume.findOne({ userId }).lean();

      if (!resumeDoc) {
        cleanupFile();
        return res.status(400).json({
          success: false,
          code: "NO_PREMIUM_RESUME",
          message: "Premium resume not found. Please create it first (₹50).",
        });
      }
      isPremium = true;
      resumeSnapshot = resumeDoc;
    } else {
      /* ── OPTION 2: Manual PDF upload ── */
      if (internship.requiresPremiumResume) {
        cleanupFile();
        return res.status(400).json({
          success: false,
          code: "PREMIUM_REQUIRED",
          message: "This listing accepts only Premium ATS resumes.",
        });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload your resume PDF." });
      }
      pdfPath = req.file.path.replace(/\\/g, "/");
    }

    /* 6️⃣ Save */
    const application = await Application.create({
      userId,
      internshipId,
      isPremium,
      resume: resumeSnapshot,
      pdfPath,
      screening,
      status: "Pending",
    });

    /* 7️⃣ Counters */
    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { monthlyApplicationsCount: 1 } }),
      Internship.findByIdAndUpdate(internshipId, { $inc: { applicationsCount: 1 } }),
    ]);

    /* 8️⃣ Confirmation email (optional) */
    if (user.email) {
      sendEmail(user.email, `Application Received — ${internship.title} ✅`, {
        html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#222;line-height:1.7">
          <h2 style="margin:0 0 12px">Hi ${user.name || "Candidate"},</h2>
          <p>Your application for <b>${internship.title}</b> at <b>${internship.companyName}</b> has been submitted successfully 🎉</p>
          <p style="font-size:13px;color:#555">
            <b>Resume used:</b> ${isPremium ? "Premium ATS Resume ⭐" : "Uploaded PDF 📄"}<br/>
            <b>Availability:</b> ${screening.readyToJoinImmediately ? "Immediate ⚡" : screening.availableFrom || "-"}
          </p>
          <p>We'll notify you as soon as the recruiter reviews your profile.</p>
          <br/><p>Best regards,<br/><b>CareerSphere Team</b></p></div>`,
      }).catch((e) => console.log("Email failed:", e.message));
    }

    return res.status(201).json({
      success: true,
      message: `Applied to ${internship.title} at ${internship.companyName} 🎉`,
      appliedWith: isPremium ? "Premium ATS Resume" : "Uploaded PDF",
      application,
      remaining: limit === Infinity ? "Unlimited" : Math.max(0, limit - used - 1),
    });
  } catch (error) {
    cleanupFile();
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        code: "ALREADY_APPLIED",
        message: "You have already applied here ✅",
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ Check: maine apply kiya kya? ══════════ */
exports.checkApplied = async (req, res) => {
  try {
    const userId = getUid(req);
    const app = await Application.findOne({
      userId,
      internshipId: req.params.id,
    }).select("status createdAt isPremium");

    return res.json({ success: true, applied: !!app, application: app });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ Mere applications ══════════ */
exports.myApplications = async (req, res) => {
  try {
    const userId = getUid(req);

    const apps = await Application.find({ userId })
      .populate({
        path: "internshipId",
        select: "title companyName companyLogo location stipend deadline slug category",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, applications: apps, total: apps.length });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ ADMIN: UPDATE APPLICATION STATUS ══════════ */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalizedStatus = String(status || "").trim();

    const allowed = [
      "Pending",
      "Applied",
      "Shortlisted",
      "Accepted",
      "Selected",
      "Rejected",
    ];

    if (!allowed.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status: normalizedStatus },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("internshipId", "title companyName");

    if (!application)
      return res.status(404).json({ success: false, message: "Application not found" });

    const email = application.userId?.email;
    const name = application.userId?.name || "Candidate";
    const job = application.internshipId?.title || "the position";
    const co = application.internshipId?.companyName || "CareerSphere";

    const tpl = {
      Shortlisted: [`You're Shortlisted for ${job}! 🎯`,
        `Great news! Our team reviewed your profile for <b>${job}</b> at <b>${co}</b> and found your skills impressive. You've been <b>shortlisted</b> for the next round. We'll connect soon regarding interviews.`],
      Accepted: [`Congratulations! Offer for ${job} 🎉`,
        `We're thrilled to inform you that you have been <b>Accepted</b> for <b>${job}</b> at <b>${co}</b>! An onboarding manager will reach out shortly with terms and timeline. Welcome aboard!`],
      Selected: [`Congratulations! Selected for ${job} 🎉`,
        `You have been <b>Selected</b> for <b>${job}</b> at <b>${co}</b>. Onboarding details coming soon!`],
      Rejected: [`Application Update: ${job}`,
        `Thank you for applying for <b>${job}</b> at <b>${co}</b>. While your qualifications impressed us, we're moving ahead with candidates closer to immediate project needs. Your profile is saved for future openings — do apply again!`],
    }[normalizedStatus];   // ✅ FIXED: was [status] — trimmed/normalized value use karo

    if (email && tpl) {
      sendEmail(email, tpl[0], {
        html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#222;line-height:1.7">
          <h2 style="margin:0 0 12px">Hi ${name},</h2>
          <p>${tpl[1]}</p>
          <br/><p>Best regards,<br/><b>interArea Team</b></p></div>`,
      }).catch((e) => console.log("Email failed:", e.message));
    }

    return res.json({ success: true, message: `Marked as ${normalizedStatus}`, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ ADMIN: DELETE APPLICATION ══════════ */
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Delete application
    await Application.findByIdAndDelete(id);

    // Decrease internship application count
    if (application.internshipId) {
      await Internship.findByIdAndUpdate(
        application.internshipId,
        { $inc: { applicationsCount: -1 } }
      );
    }

    
    if (application.userId) {
      await User.findByIdAndUpdate(
        application.userId,
        { $inc: { monthlyApplicationsCount: -1 } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};