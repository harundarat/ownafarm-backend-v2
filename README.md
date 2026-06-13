# Ownafarm Backend

[![CI](https://github.com/<your-github-username>/ownafarm-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-github-username>/ownafarm-backend/actions/workflows/ci.yml)

Event-driven backend for **Ownafarm**, a Web3 agricultural investment platform. Users invest in farm projects directly from their wallet to a smart contract — the backend is **not** the source of truth for transactions. Instead, it builds an off-chain read model from on-chain events: ingesting blockchain events, processing them idempotently, and serving portfolio/ledger data through a REST API.

> This is a ground-up rewrite of a hackathon project, built as a portfolio piece with a focus on **clean architecture, testability, event-driven processing, and consistency/idempotency under concurrency**. Every significant technical decision is documented as an ADR in [`docs/decisions/`](docs/decisions/).

## Architecture

```mermaid
flowchart LR
    W[User Wallet] --> SC[Smart Contract]
    SC --> AL[Alchemy Webhook]
    AL --> CE["apps/chain-events (Go)\nverify · dedup · normalize"]
    CE --> Q[(AWS SQS)]
    Q --> WK["apps/worker (Go)\nidempotent processing\npessimistic locking"]
    WK --> DB[(MySQL\nownafarm_core)]
    DB --> API["apps/api (TypeScript)\nREST · optimistic locking"]
    API --> FE[Frontend]
    CE --> CDB[(MySQL\nownafarm_chain_events)]
```

Three rules govern the system:

1. **Blockchain events are the source of truth** for investments, yields, and payouts. The API confirms investments based on processed on-chain events, never on frontend requests.
2. **No cross-database reads.** `apps/api` and `apps/worker` own `ownafarm_core`; `apps/chain-events` owns `ownafarm_chain_events`. They communicate only through SQS.
3. **The worker must be idempotent.** Duplicate events must never double-apply to positions or the ledger.

## Status

| Phase | Scope | Status |
|---|---|---|
| **1 — Core API (TypeScript)** | Express 5 API, auth (argon2id + JWT), wallets, farm offerings, investment intents (optimistic locking), portfolio read model, CI | 🟡 In progress |
| **2 — Event Processing (Go)** | `chain-events` webhook ingestion, SQS via LocalStack, `worker` with worker pool + pessimistic locking + idempotency | ⚪ Planned |
| **3 — Production-like Polish** | gRPC transaction tracking, payout/yield, reconciliation, Cloudflare R2 report storage (S3-compatible), Grafana/Prometheus/Loki | ⚪ Planned |

## Tech Stack

| Layer | Technology |
|---|---|
| Core API | Node.js 24 LTS, Express 5, TypeScript (strict, ESM), Prisma 7, Zod 4 |
| Event services *(Phase 2)* | Go, gRPC, AWS SQS (LocalStack for local dev) |
| Database | MySQL 9.7 LTS (Decimal money types, UUIDv7 keys) |
| Cache / locks | Redis 8.8 |
| Object storage *(Phase 3)* | Cloudflare R2 (S3-compatible) |
| Testing | Vitest, Supertest |
| Tooling | pnpm workspaces, Docker Compose, GitHub Actions, Makefile |

## Quick Start

**Prerequisites:** Node.js 24 (LTS), [pnpm](https://pnpm.io), Docker.

```bash
# 1. Clone and install
git clone https://github.com/<your-github-username>/ownafarm-backend.git
cd ownafarm-backend
pnpm install

# 2. Start infrastructure (MySQL 9.7 + Redis 8.8)
make up

# 3. Configure environment
cp apps/api/.env.example apps/api/.env

# 4. Run database migrations
make migrate

# 5. Start the API (hot reload)
make dev
```

Verify it works:

```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

Run the test suite:

```bash
make test
```

## Environment Variables

Defined and validated fail-fast at boot via Zod (`apps/api/src/shared/config/env.ts`) — a missing or malformed variable stops the app with a clear message instead of crashing at runtime.

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `3000` |
| `DATABASE_URL` | MySQL connection string (CLI + runtime, single source of truth) | `mysql://root:root@localhost:3306/ownafarm_core` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Access-token signing secret (min. 32 chars) | — |

## Make Targets

| Command | What it does |
|---|---|
| `make up` / `make down` | Start / stop MySQL + Redis containers |
| `make dev` | Run the API with hot reload (`tsx watch`) |
| `make test` | Run the API test suite |
| `make migrate` | Apply Prisma migrations |

## API Endpoints (current)

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `POST` | `/api/auth/register` | Create an account (argon2id-hashed password) |
| `POST` | `/api/auth/login` | Obtain a JWT access token |

## Project Structure

```txt
ownafarm-backend/
├── apps/
│   ├── api/             # Express 5 + TypeScript — core REST API
│   ├── chain-events/    # Go — blockchain event ingestion        (Phase 2)
│   └── worker/          # Go — async, idempotent event processor (Phase 2)
├── packages/            # shared tsconfig / eslint-config
├── infra/
│   ├── compose/         # docker-compose.yml
│   └── docker/          # mysql init scripts, etc.
├── docs/
│   └── decisions/       # Architecture Decision Records (ADRs)
├── .github/workflows/   # CI: prisma generate → typecheck → lint → test
└── Makefile
```

Inside `apps/api`, every domain module follows the same layering — **route → controller → service → repository → Prisma** — wired by hand in a composition root (no DI framework). Controllers never touch Prisma; repositories are the only place queries live; errors flow to a single centralized middleware.

## Design Decisions

The reasoning behind every non-obvious choice lives in [`docs/decisions/`](docs/decisions/). Highlights:

- **`DECIMAL(36,18)` for all monetary values** — never floats. Rounding errors are unacceptable in a ledger ([ADR-010](docs/decisions/010-decimal-for-money.md)).
- **UUIDv7 primary keys** — non-enumerable (no information leakage) *and* time-sortable (B-tree friendly) ([ADR-009](docs/decisions/009-uuidv7-primary-keys.md)).
- **Optimistic locking** for low-contention status transitions in the API; **pessimistic locking** (`SELECT ... FOR UPDATE`) for high-contention ledger updates in the worker — trade-offs documented in [`docs/concurrency.md`](docs/concurrency.md) *(Phase 2)*.
- **MySQL 9.7 LTS over the 9.x Innovation track** — an investment domain needs behavioral predictability, not the newest features ([ADR-014](docs/decisions/)).
- **Modular core + separated Go services**, not full microservices — services are split only where the domain boundary is real ([ADR-013](docs/decisions/)).

## License

MIT
