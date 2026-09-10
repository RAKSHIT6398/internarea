const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UAParser = require("ua-parser-js");
const OTP = require("../models/OTP");
const sendEmail = require("../utils/sendEmail");
const LoginHistory = require("../models/LoginHistory");
const Post = require("../models/Post");
const Resume = require("../models/Resume");
const Application = require("../models/Application");
const Friend = require("../models/Friend");

const LOGIN_TIMEZONE = process.env.LOGIN_TIMEZONE || "Asia/Kolkata";



const getLoginMeta = (req) => {
  const parser = new UAParser(req.headers["user-agent"] || "");
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
      : req.ip || req.socket?.remoteAddress || "Unknown"
  ).trim();

  return {
    browser: result.browser?.name || "Unknown",
    os: result.os?.name || "Unknown",
    device,
    ipAddress,
  };
};

const isChromeBrowser = (browser = "") => {
  const browserName = browser.trim();

 
  return (
    /^chrome(?:\s|$)/i.test(browserName) &&
    !/edge|edg|opera|opr/i.test(browserName)
  );
};

const isMobileLoginAllowed = () => {
  let hour;

  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: LOGIN_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hourPart = parts.find((part) => part.type === "hour");
    hour = Number(hourPart?.value);
  } catch {
    hour = new Date().getHours();
  }

  // 10:00 AM inclusive, 1:00 PM exclusive
  return hour >= 10 && hour < 13;
};

const saveLoginHistory = async ({
  userId = null,
  email,
  meta,
  loginMethod,
  status = "SUCCESS",
  failureReason,
}) => {
  try {
    const historyData = {
      userId,
      email,
      browser: meta.browser,
      os: meta.os,
      device: meta.device,
      ipAddress: meta.ipAddress,
      loginMethod,
      status,
      failureReason,
    };

    await LoginHistory.create(historyData);
  } catch (error) {
    console.error("Login history error:", error.message);
  }
};

const sendLoginOtp = async (email) => {
  const otp = crypto.randomInt(100000, 1000000).toString();

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
        <title>interArea Login Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:30px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;">interArea</h1>
            <p style="margin-top:8px;color:#e5e7eb;">Secure Account Login</p>
          </div>

          <div style="padding:40px;">
            <h2 style="color:#111827;">Verify Your Identity</h2>

            <p style="color:#4b5563;font-size:16px;line-height:1.6;">
              You requested a verification code to log into your interArea account.
              Use the secure OTP below to complete your login:
            </p>

            <div style="text-align:center;margin:35px 0;">
              <div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;color:#2563eb;padding:18px 40px;border-radius:10px;font-size:34px;font-weight:bold;letter-spacing:8px;">
                ${otp}
              </div>
            </div>

            <p style="color:#6b7280;">
              This OTP is valid for <strong>5 minutes</strong>.
            </p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

            <p style="text-align:center;color:#9ca3af;font-size:13px;">
              © 2026 interArea. All rights reserved.
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

// ==========================================
// REGISTER USER
// ==========================================

exports.register = async (req, res) => {
  try {
    const { name, email, password, verifiedToken } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!verifiedToken) {
      return res.status(403).json({
        success: false,
        message: "Email verification required",
      });
    }

    try {
      const decoded = jwt.verify(
        verifiedToken,
        process.env.JWT_SECRET
      );

      if (
        decoded.purpose !== "email-verify" ||
        decoded.email !== cleanEmail
      ) {
        throw new Error("Invalid verification token");
      }
    } catch {
      return res.status(403).json({
        success: false,
        message: "Email verification required",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// EMAIL/PASSWORD LOGIN
// ==========================================

exports.login = async (req, res) => {
  const meta = getLoginMeta(req);

  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user) {
      await saveLoginHistory({
        userId: null,
        email: cleanEmail,
        meta,
        loginMethod: "password",
        status: "FAILED",
        failureReason: "User not found",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      await saveLoginHistory({
        userId: user._id,
        email: cleanEmail,
        meta,
        loginMethod: "password",
        status: "FAILED",
        failureReason: "Google account used with password login",
      });

      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Use Continue with Google.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await saveLoginHistory({
        userId: user._id,
        email: cleanEmail,
        meta,
        loginMethod: "password",
        status: "FAILED",
        failureReason: "Invalid password",
      });

      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Mobile rule
    if (meta.device === "mobile" && !isMobileLoginAllowed()) {
      await saveLoginHistory({
        userId: user._id,
        email: cleanEmail,
        meta,
        loginMethod: "password",
        status: "BLOCKED",
        failureReason: "Mobile login outside allowed time",
      });

      return res.status(403).json({
        success: false,
        message: "Mobile login allowed only between 10AM and 1PM",
      });
    }

    // Chrome rule
    // Separate if hai, else-if nahi.
    // Isse mobile Chrome par mobile time check ke baad OTP lagega.
    if (isChromeBrowser(meta.browser)) {
      try {
        await sendLoginOtp(cleanEmail);

        await saveLoginHistory({
          userId: user._id,
          email: cleanEmail,
          meta,
          loginMethod: "password",
          status: "OTP_PENDING",
        });

        return res.status(200).json({
          success: true,
          otpRequired: true,
          email: cleanEmail,
          loginMethod: "password",
          message: "OTP sent to registered email",
        });
      } catch (otpError) {
        await saveLoginHistory({
          userId: user._id,
          email: cleanEmail,
          meta,
          loginMethod: "password",
          status: "FAILED",
          failureReason: "OTP email could not be sent",
        });

        return res.status(500).json({
          success: false,
          message: "Unable to send login OTP",
        });
      }
    }

    // Non-Chrome desktop/laptop direct login
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await saveLoginHistory({
      userId: user._id,
      email: cleanEmail,
      meta,
      loginMethod: "password",
      status: "SUCCESS",
    });

    const userData = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      user: userData,
    });
  } catch (error) {
    console.error("Password login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// VERIFY LOGIN OTP
// ==========================================

exports.verifyLoginOtp = async (req, res) => {
  const meta = getLoginMeta(req);

  try {
    const { email, otp } = req.body;

    if (!email?.trim() || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    // OTP verification request bhi Chrome se honi chahiye
    if (!isChromeBrowser(meta.browser)) {
      if (user) {
        await saveLoginHistory({
          userId: user._id,
          email: cleanEmail,
          meta,
          loginMethod: "otp",
          status: "FAILED",
          failureReason: "OTP verification attempted from non-Chrome browser",
        });
      }

      return res.status(403).json({
        success: false,
        message: "OTP verification must be completed in Google Chrome",
      });
    }

    // Mobile time rule ko verification stage par bhi check karein
    if (meta.device === "mobile" && !isMobileLoginAllowed()) {
      if (user) {
        await saveLoginHistory({
          userId: user._id,
          email: cleanEmail,
          meta,
          loginMethod: "otp",
          status: "BLOCKED",
          failureReason: "Mobile OTP verification outside allowed time",
        });
      }

      return res.status(403).json({
        success: false,
        message: "Mobile login allowed only between 10AM and 1PM",
      });
    }

    const otpRecord = await OTP.findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!otpRecord) {
      if (user) {
        await saveLoginHistory({
          userId: user._id,
          email: cleanEmail,
          meta,
          loginMethod: "otp",
          status: "FAILED",
          failureReason: "Invalid OTP",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      if (user) {
        await saveLoginHistory({
          userId: user._id,
          email: cleanEmail,
          meta,
          loginMethod: "otp",
          status: "FAILED",
          failureReason: "OTP expired",
        });
      }

      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await OTP.deleteMany({
      email: cleanEmail,
    });

    await saveLoginHistory({
      userId: user._id,
      email: cleanEmail,
      meta,
      loginMethod: "otp",
      status: "SUCCESS",
    });

    const userData = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      user: userData,
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================

exports.getProfile = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [
      posts,
      applicationDocs,
      loginHistory,
      resume,
      friends,
      friendRequests,
    ] = await Promise.all([
      Post.find({
        userId,
      }).sort({
        createdAt: -1,
      }),

      Application.find({
        userId,
      })
        .populate({
          path: "internshipId",
          select:
            "title companyName companyLogo location stipend deadline slug category internshipType",
        })
        .sort({
          createdAt: -1,
        }),

      LoginHistory.find({
        userId,
      }).sort({
        loginTime: -1,
      }),

      Resume.findOne({
        userId,
      }),

      Friend.find({
        userId,
        status: "accepted",
      }).populate(
        "friendId",
        "name email profileImage"
      ),

      Friend.find({
        friendId: userId,
        status: "pending",
      }).populate(
        "userId",
        "name email profileImage"
      ),
    ]);

    const applications = applicationDocs.map((application) => {
      const app = application.toObject();

      return {
        ...app,
        internship: app.internshipId,
        status:
          app.status === "Applied"
            ? "Pending"
            : app.status,
        appliedAt: app.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      user,
      posts,
      applications,
      loginHistory,
      resume,
      friends,
      friendRequests,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load profile",
    });
  }
};

// ==========================================
// DELETE LOGIN HISTORY
// ==========================================

exports.deleteLoginHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await LoginHistory.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Login record not found or unauthorized",
      });
    }

    await LoginHistory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Login activity deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};