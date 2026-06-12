import { describe, expect, it } from "vitest";
import argon2 from "argon2";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { AppError } from "../src/shared/errors/app-error.js";
import type { AuthRepository } from "../src/modules/auth/auth.repository.js";
import type { User } from "../src/generated/prisma/client.js";

function makeFakeRepo(users: User[] = []): AuthRepository {
  return {
    findByEmail: async (email: string) =>
      users.find((u) => u.email === email) ?? null,

    createUser: async (data: { email: string; passwordHash: string }) => {
      const user = {
        id: crypto.randomUUID(),
        email: data.email,
        passwordHash: data.passwordHash,
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
    });

    expect(result.email).toBe("a@b.com");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("register rejects duplicate email with 409", async () => {
    const service = new AuthService(makeFakeRepo());
    await service.register({ email: "a@b.com", password: "password123" });

    await expect(
      service.register({ email: "a@b.com", password: "password123" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("login rejects wrong password with the same message as unknown email", async () => {
    const hash = await argon2.hash("correct password");
    const repo = makeFakeRepo([
      {
        id: "1",
        email: "a@b.com",
        passwordHash: hash,
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
});
