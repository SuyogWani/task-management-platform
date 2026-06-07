const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/server");
const pool = require("../src/db");

jest.mock("../src/db", () => ({
  query: jest.fn(),
}));

describe("Tasks routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    pool.query.mockReset();
  });

  it("returns tasks for authenticated users", async () => {
    const token = jwt.sign({ id: 42, name: "Test", email: "test@example.com" }, process.env.JWT_SECRET);
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          title: "Test task",
          description: "A task description",
          status: "TODO",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Test task");
  });
});
