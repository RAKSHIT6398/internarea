const jwt = require("jsonwebtoken");


const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    const uid = decoded.id || decoded._id || decoded.userId || decoded.user?.id;
    req.user = uid ? { ...decoded, id: uid, _id: uid, userId: uid } : null;
  } catch {
    req.user = null;
  }
  next();
};

module.exports = optionalAuth;