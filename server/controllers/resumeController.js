// const Resume = require("../models/Resume");
// const path = require("path");

// const toRelative = (file) => {
//   if (!file) return "";
//   if (file.filename) return `uploads/${file.filename}`;
//   return String(file.path || "")
//     .replace(/\\/g, "/")
//     .replace(/^.*\/uploads\//, "uploads/");
// };


// const PROTECTED_FIELDS = [
//   "isPaid", "paymentId", "orderId", "amountPaid", "paidAt",
//   "userId", "_id", "__v",
// ];

// exports.createResume = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user._id || req.user.userId;
//     const newPdf = req.file ? toRelative(req.file) : null;

//     let resumeData = req.body.resumeData
//       ? typeof req.body.resumeData === "string"
//         ? JSON.parse(req.body.resumeData)
//         : req.body.resumeData
//       : {};

   
//     PROTECTED_FIELDS.forEach((f) => delete resumeData[f]);

//     const existing = await Resume.findOne({ userId });

//     const resume = await Resume.findOneAndUpdate(
//       { userId },
//       {
//         $set: {
//           ...resumeData,
//           userId,
//           pdfPath: newPdf || existing?.pdfPath || "",
//         },
//       },
//       { new: true, upsert: true }
//     );

//     res.status(201).json({ success: true, resume, message: "Resume saved!" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getMyResume = async (req, res) => {
//   try {
//     const resume = await Resume.findOne({ userId: req.user.id });

//     if (!resume) {
//       return res.status(404).json({
//         success: false,
//         message: "Resume not found for this user.",
//       });
//     }

//     res.status(200).json({ success: true, resume });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* ═══════ 💎 PREMIUM STATUS ═══════ */
// let PaymentModel = null;
// try { PaymentModel = require("../models/Payment"); } catch (_) {}

// const _uid = (req) => req.user.id || req.user._id || req.user.userId;

// exports.getMyResumeStatus = async (req, res) => {
//   try {
//     const userId = _uid(req);
//     const resume = await Resume.findOne({ userId }).lean({ virtuals: true });

//     if (!resume) {
//       return res.json({
//         success: true,
//         hasResume: false,
//         hasPremiumResume: false,
//         completeness: 0,
//         resume: null,
//       });
//     }

//     let isPaid = resume.isPaid === true || !!resume.paymentId;

   
//     if (!isPaid && PaymentModel) {
//       const pay = await PaymentModel.findOne({
//         userId,
//         type: "premium_resume",      
//       }).sort({ createdAt: -1 }).lean();

//       if (pay) {
//         isPaid = true;
//         await Resume.updateOne(
//           { _id: resume._id },
//           {
//             $set: {
//               isPaid: true,
//               paymentId: pay.razorpay_payment_id || "",
//               amountPaid: pay.amount || 50,
//               paidAt: pay.paymentDate || new Date(),
//             },
//           }
//         );
//       }
//     }

//     return res.json({
//       success: true,
//       hasResume: true,
//       hasPremiumResume: isPaid,
//       isReadyToApply: isPaid && !!resume.fullName,
//       completeness: resume.completeness ?? 0,
//       resume: {
//         _id: resume._id,
//         fullName: resume.fullName,
//         email: resume.email,
//         phone: resume.phone,
//         skillsCount: (resume.skills || []).length,
//         templateId: resume.templateId,
//         updatedAt: resume.updatedAt,
//         paidAt: resume.paidAt,
//       },
//     });
//   } catch (e) {
//     return res.status(500).json({ success: false, message: e.message });
//   }
// };

const Resume = require("../models/Resume");
const fs = require("fs");
const path = require("path");

let PaymentModel = null;
try {
  PaymentModel = require("../models/Payment");
} catch (_) {}

const PROTECTED_FIELDS = [
  "isPaid",
  "paymentId",
  "orderId",
  "amountPaid",
  "paidAt",
  "userId",
  "_id",
  "__v",
];

const _uid = (req) => req.user?.id || req.user?._id || req.user?.userId;

const toRelative = (file) => {
  if (!file) return "";
  if (file.filename) return `uploads/${file.filename}`;
  return String(file.path || "")
    .replace(/\\/g, "/")
    .replace(/^.*\/uploads\//, "uploads/");
};

const toFileUrl = (req, relativePath) => {
  if (!relativePath) return "";
  const clean = String(relativePath).replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${clean}`;
};

const safeDeleteUpload = (relativePath) => {
  try {
    if (!relativePath || !String(relativePath).startsWith("uploads/")) return;
    const fullPath = path.join(__dirname, "..", relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (_) {}
};

const getLatestPremiumPayment = async (userId) => {
  if (!PaymentModel) return null;

  // Agar tumhare Payment schema me status field hai,
  // to yahan status: "success" ya "paid" bhi add kar sakte ho.
  const payment = await PaymentModel.findOne({
    userId,
    type: "premium_resume",
  })
    .sort({ createdAt: -1 })
    .lean();

  return payment;
};

exports.createResume = async (req, res) => {
  try {
    const userId = _uid(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!PaymentModel) {
      return res.status(500).json({
        success: false,
        message: "Payment system not configured",
      });
    }

    const payment = await getLatestPremiumPayment(userId);

    if (!payment) {
      return res.status(403).json({
        success: false,
        message: "Premium resume payment required before saving resume.",
      });
    }

    let resumeData = {};

    if (req.body.resumeData) {
      try {
        resumeData =
          typeof req.body.resumeData === "string"
            ? JSON.parse(req.body.resumeData)
            : req.body.resumeData;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid resumeData JSON",
        });
      }
    }

    PROTECTED_FIELDS.forEach((f) => delete resumeData[f]);

    const existing = await Resume.findOne({ userId });
    const oldPdfPath = existing?.pdfPath || "";
    const newPdfPath = req.file ? toRelative(req.file) : "";

    const updatePayload = {
      ...resumeData,
      userId,
      pdfPath: newPdfPath || oldPdfPath || "",
      isPaid: true,
      paymentId: payment.razorpay_payment_id || payment.paymentId || "",
      orderId: payment.razorpay_order_id || payment.orderId || "",
      amountPaid: payment.amount || 50,
      paidAt: payment.paymentDate || payment.createdAt || new Date(),
    };

    const resume = await Resume.findOneAndUpdate(
      { userId },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (newPdfPath && oldPdfPath && oldPdfPath !== newPdfPath) {
      safeDeleteUpload(oldPdfPath);
    }

    return res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? "Resume updated successfully!" : "Resume saved successfully!",
      resume: {
        ...resume.toObject(),
        pdfUrl: toFileUrl(req, resume.pdfPath),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyResume = async (req, res) => {
  try {
    const userId = _uid(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found for this user.",
      });
    }

    let isPaid = resume.isPaid === true || !!resume.paymentId;

    if (!isPaid && PaymentModel) {
      const payment = await getLatestPremiumPayment(userId);

      if (payment) {
        isPaid = true;

        await Resume.updateOne(
          { _id: resume._id },
          {
            $set: {
              isPaid: true,
              paymentId: payment.razorpay_payment_id || payment.paymentId || "",
              orderId: payment.razorpay_order_id || payment.orderId || "",
              amountPaid: payment.amount || 50,
              paidAt: payment.paymentDate || payment.createdAt || new Date(),
            },
          }
        );

        resume.isPaid = true;
        resume.paymentId = payment.razorpay_payment_id || payment.paymentId || "";
        resume.orderId = payment.razorpay_order_id || payment.orderId || "";
        resume.amountPaid = payment.amount || 50;
        resume.paidAt = payment.paymentDate || payment.createdAt || new Date();
      }
    }

    return res.status(200).json({
      success: true,
      resume: {
        ...resume.toObject(),
        isPaid,
        pdfUrl: toFileUrl(req, resume.pdfPath),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyResumeStatus = async (req, res) => {
  try {
    const userId = _uid(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const resume = await Resume.findOne({ userId }).lean({ virtuals: true });

    if (!resume) {
      return res.json({
        success: true,
        hasResume: false,
        hasPremiumResume: false,
        completeness: 0,
        resume: null,
      });
    }

    let isPaid = resume.isPaid === true || !!resume.paymentId;

    if (!isPaid && PaymentModel) {
      const payment = await getLatestPremiumPayment(userId);

      if (payment) {
        isPaid = true;

        await Resume.updateOne(
          { _id: resume._id },
          {
            $set: {
              isPaid: true,
              paymentId: payment.razorpay_payment_id || payment.paymentId || "",
              orderId: payment.razorpay_order_id || payment.orderId || "",
              amountPaid: payment.amount || 50,
              paidAt: payment.paymentDate || payment.createdAt || new Date(),
            },
          }
        );

        resume.isPaid = true;
        resume.paymentId = payment.razorpay_payment_id || payment.paymentId || "";
        resume.orderId = payment.razorpay_order_id || payment.orderId || "";
        resume.amountPaid = payment.amount || 50;
        resume.paidAt = payment.paymentDate || payment.createdAt || new Date();
      }
    }

    return res.json({
      success: true,
      hasResume: true,
      hasPremiumResume: isPaid,
      isReadyToApply: isPaid && !!resume.fullName,
      completeness: resume.completeness ?? 0,
      resume: {
        _id: resume._id,
        fullName: resume.fullName,
        email: resume.email,
        phone: resume.phone,
        skillsCount: (resume.skills || []).length,
        templateId: resume.templateId,
        updatedAt: resume.updatedAt,
        paidAt: resume.paidAt,
        pdfPath: resume.pdfPath || "",
        pdfUrl: toFileUrl(req, resume.pdfPath),
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};