const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Liveness
app.get("/liveness", (req, res) => {
  res.status(200).json({
    status: "alive"
  });
});

// Readiness
app.get("/readiness", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ready",
      database: "connected"
    });
  } catch (error) {
    console.error("Readiness check failed:", error.message);

    res.status(503).json({
      status: "not-ready",
      database: "disconnected"
    });
  }
});

// Health
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

// Products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, price FROM products ORDER BY id"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch products:", error.message);

    res.status(500).json({
      error: "Failed to fetch products"
    });
  }
});

module.exports = app;
