import { describe, expect, it } from "vitest";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { AppError } from "../src/shared/errors/app-error.js";
import type { AuthRepository } from "../src/modules/auth/auth.repository.js";
import type { User } from "../src/generated/prisma/client.js";

function makeFakeRepo(users: User[] = []): AuthRepository {
  return {
    findByEmail: async (email: string) =>
      users.find((u) => u.email === email) ?? null,

    createUser: async (data: { email: string; passwordHash: string; role: "investor" | "farmer" }) => {
      const user = {
        id: crypto.randomUUID(),
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      users.push(user);
      return user;
    },
  } as AuthRepository;
}

describe("AuthService", () => {
  it("register hashes password and returns public fields only", async () => {
    const service = new AuthService(makeFakeRepo());
    const result = await service.register({
      email: "a@b.com",
      password: "password123",
      role: "investor",
    });

    expect(result.email).toBe("a@b.com");
    expect(result.role).toBe("investor");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("register rejects duplicate email with 409", async () => {
    const service = new AuthService(makeFakeRepo());
    await service.register({ email: "a@b.com", password: "password123", role: "farmer" });

    await expect(
      service.register({ email: "a@b.com", password: "password123", role: "farmer" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("login rejects wrong password with the same message as unknown email", async () => {
    const hash = await argon2.hash("correct password");
    const repo = makeFakeRepo([
      {
        id: "1",
        email: "a@b.com",
        passwordHash: hash,
        role: "investor",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User,
    ]);
    const service = new AuthService(repo);

    await expect(
      service.login({ email: "a@b.com", password: "wrong" }),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      service.login({ email: "x@y.com", password: "password123" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("login JWT payload includes role", async () => {
    const hash = await argon2.hash("password123");
    const repo = makeFakeRepo([
      {
        id: "1",
        email: "a@b.com",
        passwordHash: hash,
        role: "farmer",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User,
    ]);
    const service = new AuthService(repo);

    const { accessToken } = await service.login({ email: "a@b.com", password: "password123" });
    const payload = jwt.decode(accessToken) as { sub: string; role: string };

    expect(payload.sub).toBe("1");
    expect(payload.role).toBe("farmer");
  });
});
