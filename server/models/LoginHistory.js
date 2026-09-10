const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null, // Nullable to record failed attempts before a user is identified
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    os: {
      type: String,
      default: "Unknown",
    },

    device: {
      type: String,
      enum: ["desktop", "laptop", "mobile", "tablet", "Unknown"],
      default: "desktop",
    },

    ipAddress: {
      type: String,
      default: "Unknown",
    },

    loginMethod: {
      type: String,
      enum: ["password", "google", "otp", "magic_link", "github"],
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "BLOCKED", "OTP_PENDING"],
      default: "SUCCESS",
    },

    failureReason: {
      type: String,
      default: null,
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Recommended Indexes for fast lookups & analytics
loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ email: 1, createdAt: -1 });
loginHistorySchema.index({ ipAddress: 1 });

module.exports = mongoose.model("LoginHistory", loginHistorySchema);