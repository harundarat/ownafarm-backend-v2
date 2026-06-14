import { randomBytes } from "node:crypto";
import { verifyMessage } from "viem";
import type { WalletRepository } from "./wallet.repository.js";
import type { ChallengeInput, VerifyInput } from "./wallet.schema.js";
import { AppError } from "../../shared/errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";

export interface ChallengeStore {
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<unknown>;
}

const NONCE_TTL_SECONDS = 500;

export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly store: ChallengeStore,
  ) {}

  private challengeKey(chainId: number, address: string): string {
    return `wallet:challenge:${chainId}:${address}`;
  }

  async createChallenge(input: ChallengeInput): Promise<{ message: string }> {
    const nonce = randomBytes(16).toString("hex");
    const issuedAt = new Date().toISOString();

    const message = [
      "Ownafarm wants you to verify ownership of your wallet.",
      "",
      `Address: ${input.address}`,
      `Chain ID: ${input.chainId}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`,
    ].join("\n");

    await this.store.set(
      this.challengeKey(input.chainId, input.address),
      message,
      { EX: NONCE_TTL_SECONDS },
    );

    return { message };
  }

  async verifyAndLink(
    userId: string,
    input: VerifyInput,
  ): Promise<{ id: string; address: string; chainId: number }> {
    const key = this.challengeKey(input.chainId, input.address);
    const message = await this.store.get(key);
    if (!message) {
      throw new AppError(
        "Challenge expired or not found",
        400,
        "CHALLENGE_NOT_FOUND",
      );
    }

    const isValid = await verifyMessage({
      address: input.address as `0x${string}`,
      message,
      signature: input.signature as `0x${string}`,
    });
    if (!isValid) {
      throw new AppError(
        "Signature does not match address",
        401,
        "INVALID_SIGNATURE",
      );
    }

    await this.store.del(key);

    try {
      const wallet = await this.walletRepository.create({
        userId,
        chainId: input.chainId,
        address: input.address,
      });
      return {
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chainId,
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new AppError("Wallet already registered", 409, "WALLET_TAKEN");
      }

      throw err;
    }
  }

  listWallets(userId: string) {
    return this.walletRepository.listByUserId(userId);
  }

  async removeWallet(userId: string, walletId: string): Promise<void> {
    const deleted = await this.walletRepository.deleteOwnedByUser(
      walletId,
      userId,
    );
    if (deleted === 0) {
      throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
    }
  }
}
