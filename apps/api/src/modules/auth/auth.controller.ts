import type { Request, Response } from "express";
import { loginSchema, registerSchema, sendOtpSchema, verifyOtpSchema } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  sendOtp = async (req: Request, res: Response): Promise<void> => {
    const input = sendOtpSchema.parse(req.body);
    await this.authService.sendOtp(input);
    res.status(201).json({ data: { message: "OTP sent successfully" } });
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const input = verifyOtpSchema.parse(req.body);
    const result = await this.authService.verifyOtp(input);
    res.status(200).json({ data: result });
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerSchema.parse(req.body);
    const user = await this.authService.register(input);
    res.status(201).json({ data: user });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = loginSchema.parse(req.body);
    const result = await this.authService.login(input);
    res.status(200).json({ data: result });
  };
}
