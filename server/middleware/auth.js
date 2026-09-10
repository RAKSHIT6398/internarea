
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
    const uid = decoded.id || decoded._id || decoded.userId || decoded.user?.id;

    req.user = {
      ...decoded,
      id: uid,
      _id: uid,
      userId: uid,
    };

    if (!uid) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Session expired, login again" : "Invalid token";
    return res.status(401).json({ success: false, message: msg });
  }
};

module.exports = authMiddleware;