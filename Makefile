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

api-dev:
	cd apps/api && pnpm dev
