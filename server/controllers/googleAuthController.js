const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const UAParser = require("ua-parser-js");

const User = require("../models/User");
const OTP = require("../models/OTP");
const LoginHistory = require("../models/LoginHistory");
const sendEmail = require("../utils/sendEmail");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const LOGIN_TIMEZONE =
  process.env.LOGIN_TIMEZONE || "Asia/Kolkata";

// ==========================================
// LOGIN META
// ==========================================

const getLoginMeta = (req) => {
  const parser = new UAParser(
    req.headers["user-agent"] || ""
  );

  const result = parser.getResult();

  const rawDevice = result.device?.type;

  const device =
    rawDevice === "mobile" || rawDevice === "tablet"
      ? "mobile"
      : "desktop";

  const forwardedIp = req.headers["x-forwarded-for"];

  const ipAddress = (
    forwardedIp
      ? String(forwardedIp).split(",")[0]
      : req.ip ||
        req.socket?.remoteAddress ||
        "Unknown"
  ).trim();

  return {
    browser: result.browser?.name || "Unknown",
    os: result.os?.name || "Unknown",
    device,
    ipAddress,
  };
};




const isChromeBrowser = (browser = "") => {
  const browserName = browser.trim().toLowerCase();


  return (
    browserName === "chrome" ||
    browserName === "chrome headless"
  );
};



const isMobileLoginAllowed = () => {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: LOGIN_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hourPart = parts.find(
      (part) => part.type === "hour"
    );

    const hour = Number(hourPart?.value);

    // 10:00 AM inclusive, 1:00 PM exclusive
    return hour >= 10 && hour < 13;
  } catch (error) {
    const hour = new Date().getHours();
    return hour >= 10 && hour < 13;
  }
};



const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};



const saveLoginHistory = async ({
  userId,
  email,
  meta,
  status = "SUCCESS",
  failureReason,
}) => {
  try {
    await LoginHistory.create({
      userId,
      email,
      browser: meta.browser,
      os: meta.os,
      device: meta.device,
      ipAddress: meta.ipAddress,
      loginMethod: "google",
      status,
      failureReason,
    });
  } catch (error) {
    console.error(
      "Google login history error:",
      error.message
    );
  }
};


const sendLoginOtp = async (email) => {
  const otp = crypto
    .randomInt(100000, 1000000)
    .toString();

  await OTP.deleteMany({
    email,
  });

  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>interArea Login OTP</title>
      </head>

      <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
          
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:30px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;">interArea</h1>
            <p style="margin-top:8px;color:#e5e7eb;">
              Secure Account Login
            </p>
          </div>

          <div style="padding:40px;">
            <h2 style="color:#111827;">
              Verify Your Identity
            </h2>

            <p style="color:#4b5563;font-size:16px;line-height:1.6;">
              Use the OTP below to complete your login:
            </p>

            <div style="text-align:center;margin:35px 0;">
              <div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;color:#2563eb;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">
                ${otp}
              </div>
            </div>

            <p style="color:#6b7280;">
              This OTP is valid for <strong>5 minutes</strong>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, "🔐 interArea Login OTP", {
    html: htmlTemplate,
    text: `Your interArea login OTP is: ${otp}`,
  });
};


exports.googleLogin = async (req, res) => {
  const meta = getLoginMeta(req);

  // Temporary debugging ke liye
  console.log("GOOGLE LOGIN META:", meta);

  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential missing",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google payload",
      });
    }

    const googleId = payload.sub;

    const email = String(payload.email || "")
      .toLowerCase()
      .trim();

    const name =
      payload.name || email.split("@")[0];

    const picture = payload.picture || "";

    if (!email || payload.email_verified !== true) {
      return res.status(400).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    let user = await User.findOne({
      $or: [
        { googleId },
        { email },
      ],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.profileImage && picture) {
        user.profileImage = picture;
      }

      if (!user.authProvider) {
        user.authProvider = "google";
      }

      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        profileImage: picture,
        subscription: "Free",
        allowedApplications: 1,
      });
    }

    // ==========================================
    // MOBILE RESTRICTION
    // ==========================================

    if (
      meta.device === "mobile" &&
      !isMobileLoginAllowed()
    ) {
      await saveLoginHistory({
        userId: user._id,
        email,
        meta,
        status: "BLOCKED",
        failureReason:
          "Mobile login outside allowed time",
      });

      return res.status(403).json({
        success: false,
        message:
          "Mobile login allowed only between 10AM and 1PM",
      });
    }


    if (isChromeBrowser(meta.browser)) {
      try {
        await sendLoginOtp(email);

        await saveLoginHistory({
          userId: user._id,
          email,
          meta,
          status: "OTP_PENDING",
        });

       
        return res.status(200).json({
          success: true,
          otpRequired: true,
          email,
          message: "OTP sent to registered email",
        });
      } catch (otpError) {
        console.error(
          "Google OTP send error:",
          otpError.message
        );

        await saveLoginHistory({
          userId: user._id,
          email,
          meta,
          status: "FAILED",
          failureReason:
            "Unable to send Google login OTP",
        });

        return res.status(500).json({
          success: false,
          message: "Unable to send login OTP",
        });
      }
    }


    const token = signToken(user);

    await saveLoginHistory({
      userId: user._id,
      email,
      meta,
      status: "SUCCESS",
    });

    const userData = await User.findById(
      user._id
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Logged in with Google",
      token,
      role: user.role,
      user: userData,
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google login failed",
    });
  }
};