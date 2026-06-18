import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.email(),
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().min(6).max(6),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  role: z.enum(["investor", "farmer"]),
  code: z.string().min(6).max(6),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
