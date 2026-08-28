const request = require("supertest");
const app = require("../src/app");

describe("Health endpoints", () => {
  test("GET /liveness should return 200", async () => {
    const response = await request(app)
      .get("/liveness");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      status: "alive"
    });
  });
});
