const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
exports.uploadMedia = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const base64 =
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result =
      await cloudinary.uploader.upload(
        base64,
        {
          folder: "careersphere-posts",
          resource_type: "auto",
        }
      );

    res.status(200).json({
      success: true,
      url: result.secure_url,
      resourceType:
        result.resource_type,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profileImage = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(
      base64,
      {
        folder: "careersphere-profile",
      }
    );

    const user = await User.findById(req.user.id);

    user.profileImage = result.secure_url;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      profileImage: result.secure_url,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};