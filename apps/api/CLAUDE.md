# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

`apps/api` is the TypeScript REST API for Ownafarm — a Web3 agricultural investment platform. The API is intentionally **not** the source of truth for on-chain transactions; it builds an off-chain read model from blockchain events processed by separate Go services (Phase 2). The full system will be a pnpm monorepo (`pnpm-workspace.yaml` at root), and this app is `apps/api` within it.

## Commands

Run from within `apps/api/`, or use the root Makefile equivalents (`make api-dev`, `make api-test`, etc.):

```bash
pnpm dev          # tsx watch — hot reload dev server
pnpm build        # tsc compile to dist/
pnpm typecheck    # tsc --noEmit (no emit, just check)
pnpm lint         # eslint
pnpm test         # vitest run (all tests)
```

Run a single test file:
```bash
pnpm test -- tests/auth.service.test.ts
```

Manage infrastructure (from repo root):
```bash
make up           # start MySQL 9.7 + Redis 8.8 in Docker
make down         # stop containers
make api-migrate  # prisma migrate dev (schema changes)
```

After changing `prisma/schema.prisma`, regenerate the client:
```bash
pnpm exec prisma generate
```

## Architecture

### app.ts vs server.ts

`src/app.ts` exports the bare Express `app` — no DB connection, no Redis, no port listening. `src/server.ts` bootstraps infrastructure (Redis connect, mailer verify, DB ready) and calls `app.listen`. Tests import from `app.ts` directly, so no real infrastructure is required.

### Module layout

Each domain module lives in `src/modules/<name>/` and follows a fixed layering:

```
routes.ts → controller.ts → service.ts → repository.ts → Prisma
```

The module's `index.ts` is the composition root: it wires `new Repository(prisma)` → `new Service(repo, ...)` → `new Controller(service)` → `createRoutes(controller)` by hand. There is no DI framework. Controllers must never import Prisma directly; repositories are the only query layer.

### Shared infrastructure (`src/shared/`)

| Path | What lives there |
|---|---|
| `config/env.ts` | Zod-validated env vars — fails fast at boot; import `env` from here |
| `database/prisma.ts` | Prisma singleton (MariaDB adapter wired from `DATABASE_URL`) |
| `cache/redis.ts` | Redis singleton + `connectRedis()` |
| `mailer/mailer.ts` | Nodemailer SMTP transport (direct SMTP, temporary approach per ADR-016) |
| `errors/app-error.ts` | `AppError(message, statusCode, code)` — throw this for domain errors |
| `middlewares/error-handler.ts` | Catches `ZodError` (→ 400) and `AppError`; everything else → 500 |
| `middlewares/require-auth.ts` | Verifies `Bearer` JWT, sets `req.userId` |

### Prisma

Provider is `mysql`, using `@prisma/adapter-mariadb`. The generated client is output to `src/generated/prisma/` — **never edit generated files**. Migrations are in `prisma/migrations/`. Primary keys are UUID v7 (`@default(uuid(7))`); all money values must use `Decimal`.

### Wallet verification flow

The wallet module implements a signature-based ownership check:
1. `POST /api/wallets/challenge` — generates a nonce message and stores it in Redis under key `wallet:challenge:{chainId}:{address}` with a 500 s TTL.
2. `POST /api/wallets/verify` — fetches the nonce, verifies the EIP-191 signature via `viem`'s `verifyMessage`, deletes the nonce, then persists the wallet.

`WalletService` depends on `ChallengeStore` (a minimal interface, not the Redis client directly) so it can be tested without Redis.

### Error contract

- Domain errors: `throw new AppError(message, statusCode, code)` — caught by `errorHandler`, serialized as `{ error: { code, message } }`.
- Validation: `zod.parse()` at the controller; `ZodError` caught by `errorHandler`, serialized as `{ error: { code: "VALIDATION_ERROR", details: ... } }`.
- Unhandled errors: logged with pino and returned as 500.

### ESM + NodeNext

The project is `"type": "module"` with `"moduleResolution": "nodenext"`. All local imports must use the `.js` extension even though the source files are `.ts`. Example: `import { env } from "../config/env.js"`.

## Testing

Most tests don't need live infrastructure. The test runner loads `.env.test`; even though that file contains DB/Redis URLs, only tests that actually hit the DB (integration tests) need the containers running.

**Service tests** (`tests/*.service.test.ts`) — inject fake repositories as plain objects matching the repository interface. No DB, no Redis.

**Route tests** (`tests/*.routes.test.ts`) — import `app` from `src/app.ts` and drive it with `supertest`. Zod validation tests (e.g., reject bad body) don't need a real DB.

When adding a new integration test that needs the DB, ensure `make up` and `make api-migrate` have been run first.
