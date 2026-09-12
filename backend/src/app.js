const express = require("express");

const pool = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const audioRoutes = require("./routes/audioRoutes");
const processingJobRoutes = require("./routes/processingJobRoutes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "nepscribe-backend",
  });
});

app.get("/health/database", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database(), current_user"
    );

    res.json({
      status: "connected",
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/consultations", consultationRoutes);

app.use("/api/audio", audioRoutes);

app.use(
  "/api/processing-jobs",
  processingJobRoutes
);

module.exports = app;