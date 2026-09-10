


const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
   
    const usePremium = req.body.usePremium === "true";

   
    if (usePremium) {
      return next(); 
    }

    const limits = {
      free: 1,
      bronze: 3,
      silver: 5,
      gold: Infinity,
    };

    const plan = (user.subscription || "free").toLowerCase();

   
    if (
      plan !== "gold" &&
      user.monthlyApplicationsCount >= (limits[plan] || 1)
    ) {
      return res.status(403).json({
        success: false, 
        message: "Application limit reached. Upgrade your plan!",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};