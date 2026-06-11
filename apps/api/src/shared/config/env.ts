import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "invalid environment variables: ",
    z.prettifyError(parsed.error),
  );
  process.exit(1);
}

export const env = parsed.data;
