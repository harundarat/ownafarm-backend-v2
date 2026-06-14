import { z } from "zod";

const ethereumAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address")
  .transform((a) => a.toLowerCase());

export const challengeSchema = z.object({
  address: ethereumAddress,
  chainId: z.number().int().positive(),
});

export const verifySchema = z.object({
  address: ethereumAddress,
  chainId: z.number().int().positive(),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid signature"),
});

export const removeWalletSchema = z.object({
  id: z.uuid(),
});

export type ChallengeInput = z.infer<typeof challengeSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
