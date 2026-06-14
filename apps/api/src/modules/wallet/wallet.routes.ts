import { Router } from "express";
import { requireAuth } from "../../shared/middlewares/require-auth.js";
import type { WalletController } from "./wallet.controller.js";

export function createWalletRoutes(controller: WalletController): Router {
  const router = Router();

  router.use(requireAuth);

  router.post("/challenge", controller.challenge);
  router.post("/verify", controller.verify);
  router.get("/", controller.list);
  router.delete("/:id", controller.remove);

  return router;
}
