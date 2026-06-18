import { describe, expect, it } from "vitest";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { AppError } from "../src/shared/errors/app-error.js";
import type { AuthRepository } from "../src/modules/auth/auth.repository.js";
import type { OtpStore } from "../src/modules/auth/auth.service.js";
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

function makeFakeRedis(): OtpStore & { _store: Map<string, string> } {
  const _store = new Map<string, string>();
  return {
    _store,
    set: async (k: string, v: string) => { _store.set(k, v); return "OK"; },
    get: async (k: string) => _store.get(k) ?? null,
    del: async (k: string) => { _store.delete(k); return 1; },
  } as never;
}

describe("AuthService", () => {
  it("register hashes password and returns public fields only", async () => {
    const fakeRedis = makeFakeRedis();
    await fakeRedis.set("code:a@b.com", "123456", { EX: 600 });
    const service = new AuthService(makeFakeRepo(), fakeRedis);

    const result = await service.register({
      email: "a@b.com",
      password: "password123",
      role: "investor",
      code: "123456",
    });

    expect(result.email).toBe("a@b.com");
    expect(result.role).toBe("investor");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("register rejects duplicate email with 409", async () => {
    const fakeRedis = makeFakeRedis();
    const service = new AuthService(makeFakeRepo(), fakeRedis);

    await fakeRedis.set("code:a@b.com", "111111", { EX: 600 });
    await service.register({ email: "a@b.com", password: "password123", role: "farmer", code: "111111" });

    await expect(
      service.register({ email: "a@b.com", password: "password123", role: "farmer", code: "anything" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("register rejects invalid code with 400", async () => {
    const service = new AuthService(makeFakeRepo(), makeFakeRedis());

    await expect(
      service.register({ email: "a@b.com", password: "password123", role: "investor", code: "000000" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("verifyOtp consumes OTP and returns a 6-digit code", async () => {
    const fakeRedis = makeFakeRedis();
    await fakeRedis.set("otp:a@b.com", "654321", { EX: 300 });
    const service = new AuthService(makeFakeRepo(), fakeRedis);

    const { code } = await service.verifyOtp({ email: "a@b.com", otp: "654321" });

    expect(code).toMatch(/^\d{6}$/);
    expect(fakeRedis._store.has("otp:a@b.com")).toBe(false);
    expect(fakeRedis._store.get("code:a@b.com")).toBe(code);
  });

  it("verifyOtp rejects wrong OTP", async () => {
    const fakeRedis = makeFakeRedis();
    await fakeRedis.set("otp:a@b.com", "654321", { EX: 300 });
    const service = new AuthService(makeFakeRepo(), fakeRedis);

    await expect(
      service.verifyOtp({ email: "a@b.com", otp: "000000" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("verifyOtp OTP can only be used once", async () => {
    const fakeRedis = makeFakeRedis();
    await fakeRedis.set("otp:a@b.com", "654321", { EX: 300 });
    const service = new AuthService(makeFakeRepo(), fakeRedis);

    await service.verifyOtp({ email: "a@b.com", otp: "654321" });

    await expect(
      service.verifyOtp({ email: "a@b.com", otp: "654321" }),
    ).rejects.toBeInstanceOf(AppError);
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
    const service = new AuthService(repo, makeFakeRedis());

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
    const service = new AuthService(repo, makeFakeRedis());

    const { accessToken } = await service.login({ email: "a@b.com", password: "password123" });
    const payload = jwt.decode(accessToken) as { sub: string; role: string };

    expect(payload.sub).toBe("1");
    expect(payload.role).toBe("farmer");
  });
});
