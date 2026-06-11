import "dotenv/config";
import { app } from "./app.js";
import { env } from "./shared/config/env.js";
import { logger } from "./shared/logger/logger.js";
import { prisma } from "./shared/database/prisma.js";

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "ownafarm-api listening");
});

function shutdown(signal: string) {
  logger.info({ signal }, "shutting down");
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {
      logger.error({ err }, "error during prisma disconnect");
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
