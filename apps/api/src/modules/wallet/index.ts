import { redis } from "../../shared/cache/redis.js";
import { prisma } from "../../shared/database/prisma.js";
import { WalletController } from "./wallet.controller.js";
import { WalletRepository } from "./wallet.repository.js";
import { createWalletRoutes } from "./wallet.routes.js";
import { WalletService } from "./wallet.service.js";

const walletRepository = new WalletRepository(prisma);
const walletService = new WalletService(walletRepository, redis);
const walletController = new WalletController(walletService);

export const walletRoutes = createWalletRoutes(walletController);
