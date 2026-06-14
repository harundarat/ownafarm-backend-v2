// tests/wallet.service.test.ts
import { describe, expect, it } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import { WalletService } from "../src/modules/wallet/wallet.service.js";
import type { WalletRepository } from "../src/modules/wallet/wallet.repository.js";

function makeFakeRedis() {
  const store = new Map<string, string>();
  return {
    set: async (k: string, v: string) => {
      store.set(k, v);
      return "OK";
    },
    get: async (k: string) => store.get(k) ?? null,
    del: async (k: string) => {
      store.delete(k);
      return 1;
    },
  } as never;
}

function makeFakeRepo(): WalletRepository {
  const wallets: {
    id: string;
    userId: string;
    chainId: number;
    address: string;
  }[] = [];
  return {
    create: async (data: Parameters<WalletRepository["create"]>[0]) => {
      const w = { id: crypto.randomUUID(), verifiedAt: new Date(), ...data };
      wallets.push(w);
      return w as never;
    },
    listByUser: async (userId: string) =>
      wallets.filter((w) => w.userId === userId) as never,
    deleteOwnedByUser: async () => 0,
  } as unknown as WalletRepository;
}

const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
);
const address = account.address.toLowerCase();

describe("WalletService.verifyAndLink", () => {
  it("links wallet when signature matches", async () => {
    const service = new WalletService(makeFakeRepo(), makeFakeRedis());
    const { message } = await service.createChallenge({ address, chainId: 1 });
    const signature = await account.signMessage({ message });

    const wallet = await service.verifyAndLink("user-1", {
      address,
      chainId: 1,
      signature,
    });
    expect(wallet.address).toBe(address);
  });

  it("rejects mismatched signature (401)", async () => {
    const service = new WalletService(makeFakeRepo(), makeFakeRedis());
    await service.createChallenge({ address, chainId: 1 });
    const wrongSig = await account.signMessage({
      message: "different message",
    });

    await expect(
      service.verifyAndLink("user-1", {
        address,
        chainId: 1,
        signature: wrongSig,
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejects when challenge is missing or expired (400)", async () => {
    const service = new WalletService(makeFakeRepo(), makeFakeRedis());
    const signature = await account.signMessage({ message: "x" });

    await expect(
      service.verifyAndLink("user-1", { address, chainId: 1, signature }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
