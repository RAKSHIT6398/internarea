const User = require("../models/User");
const OTP = require("../models/OTP");
const sendEmail = require("../utils/sendEmail");

exports.sendLanguageOtp = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await OTP.deleteMany({
      email: user.email
    });

    await OTP.create({
      email: user.email,
      otp,
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    await sendEmail(
      user.email,
      "Language Change OTP",
      `<h2>Your OTP is ${otp}</h2>`
    );

    res.status(200).json({
      success: true,
      message: "OTP Sent"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.verifyLanguageOtp = async (req, res) => {
  try {

    const { otp } = req.body;

    const user = await User.findById(
      req.user.id
    );

    const otpRecord =
      await OTP.findOne({
        email: user.email,
        otp,
      });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      new Date() >
      otpRecord.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    user.language = "French";

    await user.save();

    await OTP.deleteMany({
      email: user.email
    });

    res.status(200).json({
      success: true,
      message:
        "Language changed to French"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.changeLanguage = async (
  req,
  res
) => {
  try {

    const { language } = req.body;

    const user =
      await User.findById(
        req.user.id
      );

    user.language = language;

    await user.save();

    res.status(200).json({
      success: true,
      language,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};