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
    if (payload.role !== "investor" && payload.role !== "farmer") {
      throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
    }
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  }
}
