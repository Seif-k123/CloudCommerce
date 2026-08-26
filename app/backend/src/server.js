const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Liveness:
// Is the application process alive?
app.get("/liveness", (req, res) => {
  res.status(200).json({
    status: "alive"
  });
});

// Readiness:
// Is the application ready to receive traffic?
// This checks PostgreSQL connectivity.
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

// General health endpoint
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

// Get products from PostgreSQL
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
