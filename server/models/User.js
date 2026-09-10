const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider !== "google";
      },
       select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    profileImage: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "English",
    },
    languageOTP: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
   subscription: {
  type: String,
  enum: ["Free", "Bronze", "Silver", "Gold", "free", "bronze", "silver", "gold"],
  default: "Free",
  
  set: (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v),
},
    subscriptionStartDate: {
      type: Date,
      default: null,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    allowedApplications: {
      type: Number,
      default: 1,
    },
    monthlyApplicationsCount: {
      type: Number,
      default: 0,
    },
    lastPasswordReset: Date,
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);