import { Router } from "express";
import type { AuthController } from "./auth.controller.js";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/send-otp", controller.sendOtp);
  router.post("/verify-otp", controller.verifyOtp);
  router.post("/register", controller.register);
  router.post("/login", controller.login);

  return router;
}
