// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
// const path = require("path");

// const postRoutes = require("./routes/postRoutes");
// const friendRoutes = require("./routes/friendRoutes");
// const resumeRoutes = require("./routes/resumeRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const userRoutes = require("./routes/userRoutes");
// const commentRoutes = require("./routes/commentRoutes");
// const shareRoutes = require("./routes/shareRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const languageRoutes = require("./routes/languageRoutes");
// const searchRoutes = require("./routes/searchRoutes");

// if (!process.env.JWT_SECRET) {
//   console.error("❌ FATAL: JWT_SECRET missing in .env");
//   process.exit(1);
// }

// const app = express();

// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:3000",
//   process.env.CLIENT_URL,
//   process.env.RENDER_EXTERNAL_URL,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
//       cb(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "2mb" }));
// app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// app.use((req, res, next) => {
//   mongoSanitize.sanitize(req.body || {});
//   mongoSanitize.sanitize(req.query || {});
//   mongoSanitize.sanitize(req.params || {});
//   next();
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 30,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { success: false, message: "Too many attempts. Try again after 15 min." },
// });

// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 500,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { success: false, message: "Too many requests, slow down." },
// });
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Internarea Backend is running 🚀",
//   });
// });
// app.use("/api", apiLimiter);

// app.get("/api/health", (req, res) => {
//   res.json({ success: true, message: "Server running" });
// });

// app.use("/api/auth/admin", require("./routes/admin"));
// app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
// app.use("/api/otp", authLimiter, require("./routes/otpRoutes"));

// app.use("/api/resume", resumeRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/upload", uploadRoutes);
// app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
// app.use("/api/internships", require("./routes/internshipRoutes"));
// app.use("/api/application", require("./routes/applicationRoutes"));
// app.use("/api/user", userRoutes);
// app.use("/api/post", postRoutes);
// app.use("/api/language", languageRoutes);
// app.use("/api/friend", friendRoutes);
// app.use("/api/comment", commentRoutes);
// app.use("/api/share", shareRoutes);
// app.use("/api/search", searchRoutes);
// app.use("/api/messages", messageRoutes);

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// /* Serve built client in production */
// if (process.env.NODE_ENV === "production") {
//   const clientDistPath = path.join(__dirname, "../client/dist");

//   app.use(express.static(clientDistPath));

//   app.get("*", (req, res, next) => {
//     if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
//       return next();
//     }
//     res.sendFile(path.join(clientDistPath, "index.html"));
//   });
// }

// /* 404 */
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.originalUrl}`,
//   });
// });

// /* ERROR HANDLER */
// app.use((err, req, res, next) => {
//   if (err.message === "Not allowed by CORS") {
//     return res.status(403).json({ success: false, message: "Origin not allowed" });
//   }

//   console.error("❌", err.message);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal server error",
//   });
// });

// module.exports = app;


const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");

const postRoutes = require("./routes/postRoutes");
const friendRoutes = require("./routes/friendRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const commentRoutes = require("./routes/commentRoutes");
const shareRoutes = require("./routes/shareRoutes");
const messageRoutes = require("./routes/messageRoutes");
const languageRoutes = require("./routes/languageRoutes");
const searchRoutes = require("./routes/searchRoutes");

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET missing in .env");
  process.exit(1);
}

const app = express();

// FIX 1: Render ke liye sabse zaruri, rate-limit se pehle hona chahiye
app.set("trust proxy", 1);

// FIX 2: Google Login popup block fix
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      console.log("❌ CORS Blocked:", origin);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body || {});
  mongoSanitize.sanitize(req.query || {});
  mongoSanitize.sanitize(req.params || {});
  next();
});

// FIX 3: validate false add kiya taaki Render pe crash na ho
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "Too many attempts. Try again after 15 min." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "Too many requests, slow down." },
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Internarea Backend is running 🚀",
  });
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server running" });
});

app.use("/api/auth/admin", require("./routes/admin"));
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/otp", authLimiter, require("./routes/otpRoutes"));

app.use("/api/resume", resumeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/internships", require("./routes/internshipRoutes"));
app.use("/api/application", require("./routes/applicationRoutes"));
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/language", languageRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/messages", messageRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Serve built client in production */
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientDistPath));

  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ERROR HANDLER */
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }

  console.error("❌", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;