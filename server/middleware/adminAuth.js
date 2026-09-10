const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("role");

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins are allowed here.",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Authorization check failed" });
  }
};

module.exports = isAdmin;