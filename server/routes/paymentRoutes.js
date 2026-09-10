const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  sendOTP,
  verifyOTP,
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");


router.post("/send-otp", authMiddleware, sendOTP);
router.post("/verify-otp", authMiddleware, verifyOTP);
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;