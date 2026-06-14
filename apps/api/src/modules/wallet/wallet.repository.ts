import { PrismaClient } from "../../generated/prisma/client.js";
import type { Wallet } from "../../generated/prisma/client.js";

export class WalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listByUserId(userId: string): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      where: { id: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: {
    userId: string;
    chainId: number;
    address: string;
  }): Promise<Wallet> {
    return this.prisma.wallet.create({
      data: {
        ...data,
        verifiedAt: new Date(),
      },
    });
  }

  async deleteOwnedByUser(id: string, userId: string): Promise<number> {
    const result = await this.prisma.wallet.deleteMany({
      where: { id, userId },
    });

    return result.count;
  }
}
