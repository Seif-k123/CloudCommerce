jest.mock("pg", () => {
  const query = jest.fn();

  return {
    Pool: jest.fn(() => ({
      query,
    })),
  };
});

const request = require("supertest");
const { Pool } = require("pg");
const app = require("../src/app");

const pool = new Pool();

describe("Health endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /liveness should return 200", async () => {
    const response = await request(app).get("/liveness");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "alive",
    });
  });

  test("GET /readiness should return 200 when database is connected", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await request(app).get("/readiness");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "ready",
      database: "connected",
    });
  });

  test("GET /readiness should return 503 when database is unavailable", async () => {
    pool.query.mockRejectedValueOnce(new Error("Database unavailable"));

    const response = await request(app).get("/readiness");

    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({
      status: "not-ready",
      database: "disconnected",
    });
  });

  test("GET /health should return 200 when database is connected", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "healthy",
      database: "connected",
    });
  });

  test("GET /health should return 503 when database is unavailable", async () => {
    pool.query.mockRejectedValueOnce(new Error("Database unavailable"));

    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({
      status: "unhealthy",
      database: "disconnected",
    });
  });
});

describe("Products endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/products should return products", async () => {
    const products = [
      { id: 1, name: "Laptop", price: 1500 },
      { id: 2, name: "Phone", price: 800 },
    ];

    pool.query.mockResolvedValueOnce({
      rows: products,
    });

    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(products);
  });

  test("GET /api/products should return 500 when database fails", async () => {
    pool.query.mockRejectedValueOnce(new Error("Database unavailable"));

    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: "Failed to fetch products",
    });
  });
});
