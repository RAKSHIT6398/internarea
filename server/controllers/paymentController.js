const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const OTP = require("../models/OTP");
const User = require("../models/User");
const Resume = require("../models/Resume");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const RESUME_PRICE_PAISE = 50 * 100;


exports.sendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email name");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const email = user.email;


    if (req.body.email && String(req.body.email).toLowerCase().trim() !== email) {
      return res.status(400).json({
        success: false,
        message: "Please use your registered email address",
      });
    }


    const recent = await OTP.findOne({
      email,
      expiresAt: { $gt: new Date(Date.now() + 4 * 60 * 1000) },
    });
    if (recent) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting a new OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

   
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>CareerSphere Resume Verification</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;">CareerSphere</h1>
      <p style="margin-top:8px;color:#e5e7eb;font-size:15px;">Premium Resume Builder</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#111827;margin-bottom:20px;">Verify Your Email</h2>
      <p style="color:#4b5563;font-size:16px;line-height:1.7;">
        Thank you for using CareerSphere Premium Resume Builder.
        Please use the verification code below to continue creating your professional resume.
      </p>
      <div style="text-align:center;margin:35px 0;">
        <div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;color:#2563eb;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">
          ${otp}
        </div>
      </div>
      <p style="color:#6b7280;font-size:15px;">This OTP is valid for <strong>5 minutes</strong>.</p>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;">If you did not request this OTP, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">
      <p style="text-align:center;color:#9ca3af;font-size:13px;">© 2026 CareerSphere. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    await sendEmail(email, "📄 Premium Resume Verification OTP", {
      html: htmlTemplate,
      text: `Your OTP for premium resume creation is ${otp}. Valid for 5 minutes.`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const email = user.email;
    const otp = String(req.body.otp || "").trim();

    const record = await OTP.findOne({ email });

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or not requested" });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }


    if ((record.attempts || 0) >= 5) {
      await OTP.deleteMany({ email });
      return res.status(429).json({
        success: false,
        message: "Too many wrong attempts. Please request a new OTP.",
      });
    }

    if (record.otp !== otp) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await OTP.deleteMany({ email });

   
    res.status(200).json({ success: true, message: "OTP Verified Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;


    const alreadyPaid = await Resume.findOne({ userId, isPaid: true }).lean();
    if (alreadyPaid) {
      return res.status(400).json({
        success: false,
        code: "ALREADY_PAID",
        message: "Premium resume is already unlocked on your account 🎉",
      });
    }

    const order = await razorpay.orders.create({
      amount: RESUME_PRICE_PAISE,          
      currency: "INR",
      receipt: `res_${String(userId).slice(-8)}_${Date.now()}`.slice(0, 40), 
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Razorpay Order Creation Failed" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    

    const userId = req.user.id;

   
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

   
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order || order.status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }
    if (order.amount !== RESUME_PRICE_PAISE) {
      return res.status(400).json({ success: false, message: "Payment amount mismatch" });
    }

    const rupees = order.amount / 100; 

   
    const existingPayment = await Payment.findOne({ razorpay_order_id });
    if (existingPayment) {
      await Resume.findOneAndUpdate(
        { userId },
        {
          $set: {
            isPaid: true,
            paymentId: existingPayment.razorpay_payment_id || razorpay_payment_id,
            orderId: razorpay_order_id,
            amountPaid: existingPayment.amount,
            paidAt: existingPayment.paymentDate || new Date(),
          },
          $setOnInsert: { userId },
        },
        { upsert: true }
      );
      return res.status(200).json({
        success: true,
        message: "Payment already recorded",
        hasPremiumResume: true,
      });
    }

  
    const newPayment = await Payment.create({
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type: "premium_resume",        
      planName: "premium_resume",    
      amount: rupees,
      status: "success",
      description: "Premium ATS Resume Builder",
      paymentDate: new Date(),
    });

    /* 5️⃣ 💎 Unlock resume */
    await Resume.findOneAndUpdate(
      { userId },
      {
        $set: {
          isPaid: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amountPaid: rupees,
          paidAt: new Date(),
        },
        $setOnInsert: { userId },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Premium Resume unlocked 🎉",
      hasPremiumResume: true,
      payment: newPayment,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
        details: err.message,
      });
    }
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
};