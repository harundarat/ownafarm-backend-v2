import crypto from "node:crypto";
import express from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./shared/logger/logger.js";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import { authRoutes } from "./modules/auth/index.js";
import { walletRoutes } from "./modules/wallet/index.js";

export const app = express();

app.use(express.json());
app.use(pinoHttp({ logger, genReqId: () => crypto.randomUUID() }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes);

app.use(errorHandler);
