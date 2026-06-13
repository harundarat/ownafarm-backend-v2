COMPOSE = docker compose -f infra/compose/docker-compose.yml

.PHONY: up down logs ps restart clean

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

restart:
	$(COMPOSE) down && $(COMPOSE) up -d

clean:
	$(COMPOSE) down -v

api-migrate:
	cd apps/api && pnpm exec prisma migrate dev

api-dev:
	cd apps/api && pnpm dev

api-test:
	cd apps/api && pnpm test

api-typecheck:
	cd apps/api && pnpm typecheck

api-lint:
	cd apps/api && pnpm lint
