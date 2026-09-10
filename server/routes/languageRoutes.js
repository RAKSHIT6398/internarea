const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  sendLanguageOtp,
  verifyLanguageOtp,
  changeLanguage,
} = require("../controllers/languageController");

router.post(
  "/send-otp",
  auth,
  sendLanguageOtp
);

router.post(
  "/verify-otp",
  auth,
  verifyLanguageOtp
);

router.post(
  "/change",
  auth,
  changeLanguage
);

module.exports = router;