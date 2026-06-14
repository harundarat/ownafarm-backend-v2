import type { Request, Response } from "express";
import {
  challengeSchema,
  removeWalletSchema,
  verifySchema,
} from "./wallet.schema.js";
import type { WalletService } from "./wallet.service.js";
import { AppError } from "../../shared/errors/app-error.js";

export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  challenge = async (req: Request, res: Response): Promise<void> => {
    const input = challengeSchema.parse(req.body);
    const result = await this.walletService.createChallenge(input);
    res.status(200).json({ data: result });
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    const input = verifySchema.parse(req.body);
    const wallet = await this.walletService.verifyAndLink(
      this.userId(req),
      input,
    );
    res.status(201).json({ data: wallet });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const wallets = await this.walletService.listWallets(this.userId(req));
    res.status(200).json({ data: wallets });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = removeWalletSchema.parse(req.params);
    await this.walletService.removeWallet(this.userId(req), id);
    res.status(204).send();
  };

  private userId(req: Request): string {
    if (!req.userId) {
      throw new AppError("Unauthenticated", 401, "UNAUTHORIZED");
    }
    return req.userId;
  }
}
