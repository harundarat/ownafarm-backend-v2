import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("POST /api/auth/register", () => {
  it("returns 400 on invalid body without touching the database", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "x" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
