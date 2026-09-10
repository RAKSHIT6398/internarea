const OTP = require("../models/OTP");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const generatePassword = require("../utils/generatePassword");
  const jwt = require("jsonwebtoken"); 
exports.sendOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
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

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ email });  
    await OTP.create({ email, otp, expiresAt });


    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>internArea OTP Verification</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">

        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;">internArea</h1>
          <p style="margin-top:8px;color:#e5e7eb;">
            Secure Account Verification
          </p>
        </div>

        <div style="padding:40px;">
          <h2 style="color:#111827;">
            Verify Your Email Address
          </h2>

          <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Welcome to interArea! Use the OTP below to verify your account and continue your journey.
          </p>

          <div style="text-align:center;margin:35px 0;">
            <div style="
              display:inline-block;
              background:#eff6ff;
              border:2px dashed #2563eb;
              color:#2563eb;
              padding:18px 40px;
              border-radius:10px;
              font-size:34px;
              font-weight:bold;
              letter-spacing:8px;
            ">
              ${otp}
            </div>
          </div>

          <p style="color:#6b7280;">
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

          <p style="color:#6b7280;">
            If you didn't request this OTP, you can safely ignore this email.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

          <p style="text-align:center;color:#9ca3af;font-size:13px;">
            © 2026 interArea. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    await sendEmail(
      email,
      "🔐 interArea OTP Verification",
      htmlTemplate
    );

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//verifyotp

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    await OTP.deleteMany({ email });

      const jwt = require("jsonwebtoken");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const today = new Date();

if (user.lastPasswordReset) {

  const lastReset = new Date(
    user.lastPasswordReset
  );

  const sameDay =
    lastReset.getDate() === today.getDate() &&
    lastReset.getMonth() === today.getMonth() &&
    lastReset.getFullYear() === today.getFullYear();

  if (sameDay) {
    return res.status(400).json({
      success: false,
      message:
        "You can use this option only once per day",
    });
  }
}

    const newPassword = generatePassword(8);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.lastPasswordReset = new Date();

    await user.save();

    // 🔥 SAME OTP STYLE TEMPLATE
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>interArea Password Reset</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">

        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;">interArea</h1>
          <p style="margin-top:8px;color:#e5e7eb;">
            Secure Account Update
          </p>
        </div>

        <div style="padding:40px;">
          <h2 style="color:#111827;">
            Password Reset Successful
          </h2>

          <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Your account password has been reset. Use the new password below to login.
          </p>

          <div style="text-align:center;margin:35px 0;">
            <div style="
              display:inline-block;
              background:#eff6ff;
              border:2px dashed #2563eb;
              color:#2563eb;
              padding:18px 40px;
              border-radius:10px;
              font-size:28px;
              font-weight:bold;
              letter-spacing:3px;
            ">
              ${newPassword}
            </div>
          </div>

          <p style="color:#6b7280;">
            For security reasons, please change your password after login.
          </p>

          <p style="color:#6b7280;">
            If you didn't request this change, please contact support immediately.
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

          <p style="text-align:center;color:#9ca3af;font-size:13px;">
            © 2026 interArea. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    await sendEmail(
      email,
      "🔐 interArea Password Reset",
      htmlTemplate
    );

    res.status(200).json({
      success: true,
      message: "New password sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};