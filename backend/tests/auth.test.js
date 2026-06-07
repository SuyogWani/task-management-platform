const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/db");

jest.mock("../src/db", () => ({
  query: jest.fn(),
}));

describe("Auth routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    pool.query.mockReset();
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await request(app).post("/api/auth/register").send({ name: "Alice" });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/required/i);
  });

  it("returns 409 when email is already registered", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "secret" });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already registered/i);
  });

  it("returns 201 and a token on success", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Alice", email: "alice@example.com" }],
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "secret" });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({ name: "Alice", email: "alice@example.com" });
  });
});
