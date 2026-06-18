import { prisma } from "../../shared/database/prisma.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { createAuthRoutes } from "./auth.routes.js";
import { redis } from "../../shared/cache/redis.js";

const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository, redis);
const authController = new AuthController(authService);

export const authRoutes = createAuthRoutes(authController);
