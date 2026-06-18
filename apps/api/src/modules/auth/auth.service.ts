import { randomInt } from "node:crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";
import { sendMail } from "../../shared/mailer/mailer.js";
import {
  otpEmailHtml,
  otpEmailText,
} from "../../shared/mailer/otp-template.js";
import type { AuthRepository } from "./auth.repository.js";
import type {
  LoginInput,
  RegisterInput,
  SendOtpInput,
  VerifyOtpInput,
} from "./auth.schema.js";

export interface OtpStore {
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<unknown>;
}

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly redis: OtpStore,
  ) {}

  async sendOtp(input: SendOtpInput): Promise<void> {
    const otp = this.generateCode();
    await this.redis.set(`otp:${input.email}`, otp, { EX: 300 });
    await sendMail({
      to: input.email,
      subject: "OwnaFarm OTP Verification",
      html: otpEmailHtml(otp),
      text: otpEmailText(otp),
    });
  }

  async verifyOtp(input: VerifyOtpInput): Promise<{ code: string }> {
    const key = `otp:${input.email}`;
    const stored = await this.redis.get(key);
    if (!stored || stored !== input.otp) {
      throw new AppError("OTP may be invalid or expired", 400, "INVALID_OTP");
    }
    await this.redis.del(key);

    const code = this.generateCode();
    await this.redis.set(`code:${input.email}`, code, { EX: 600 });
    return { code };
  }

  async register(
    input: RegisterInput,
  ): Promise<{ id: string; email: string; role: string }> {
    const existing = await this.authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already registered", 409, "EMAIL_TAKEN");
    }

    const codeKey = `code:${input.email}`;
    const registrationCode = await this.redis.get(codeKey);
    if (input.code !== registrationCode) {
      throw new AppError("Invalid registration request", 400, "INVALID_CODE");
    }
    await this.redis.del(codeKey);

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
        err.code === "P2002"
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
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
    return { accessToken };
  }

  private generateCode(): string {
    return randomInt(100000, 1000000).toString();
  }
}
