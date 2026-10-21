require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// CORS - allow frontend with credentials (for HttpOnly cookies)
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5500";
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

// Mount routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/posts", require("./routes/commentRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "BlogSpace API is running" });
});

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
