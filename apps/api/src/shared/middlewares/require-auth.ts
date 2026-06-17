import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";

interface JwtPayload {
  sub: string;
  role: "investor" | "farmer";
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(
      "Missing or malformed Authorization header",
      401,
      "UNAUTHORIZED",
    );
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw new AppError("Invalid or expire token", 401, "UNAUTHORIZED");
  }
}
