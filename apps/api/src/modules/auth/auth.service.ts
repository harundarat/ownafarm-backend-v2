import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { AuthRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ id: string; email: string; role: string }> {
    const existing = await this.authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already registered", 409, "EMAIL_TAKEN");
    }

    const passwordHash = await argon2.hash(input.password);

    try {
      const user = await this.authRepository.createUser({
        email: input.email,
        passwordHash,
        role: input.role,
      });

      return { id: user.id, email: user.email, role: user.role };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code == "P2002"
      ) {
        throw new AppError("Email already registered", 409, "EMAIL_TAKEN");
      }

      throw err;
    }
  }

  async login(input: LoginInput): Promise<{ accessToken: string }> {
    const user = await this.authRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new AppError(
        "invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const accessToken = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: "15m",
    });
    return { accessToken };
  }
}
