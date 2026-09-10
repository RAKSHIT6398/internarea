const express = require("express");

const router = express.Router();

const {sendOTP,verifyOTP,forgotPassword} = require("../controllers/otpController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post(
  "/forgot-password",
  forgotPassword
);
module.exports = router;