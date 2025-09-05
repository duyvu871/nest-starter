# Application commands
.PHONY: dev debug prod test test-watch test-cov test-e2e test-users-dev test-users-test test-users-prod format lint

dev:
	npm run start:dev

debug:
	npm run start:debug

prod:
	npm run start:prod

test:
	npm run test

test-watch:
	npm run test:watch

test-cov:
	npm run test:coverage

test-e2e:
	npm run test:e2e

test-users-dev:
	npm run test:users:dev

test-users-test:
	npm run test:users:test

test-users-prod:
	npm run test:users:prod

format:
	npm run format

lint:
	npm run lint

# Docker commands
.PHONY: docker-dev-up docker-dev-down docker-prod-up docker-prod-down

docker-dev-up:
	docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

docker-dev-down:
	docker-compose -f docker-compose.dev.yml --env-file .env.development down

docker-prod-up:
	docker-compose --env-file .env.production up -d

docker-prod-down:
	docker-compose --env-file .env.production down

# Database commands
.PHONY: db-migrate db-studio db-push-dev db-push-test db-push-prod db-seed-dev db-seed-test db-seed-prod

db-migrate:
	npm run prisma:migrate

db-studio:
	npm run prisma:studio

db-push-dev:
	npm run db:push:dev

db-push-test:
	npm run db:push:test

db-push-prod:
	npm run db:push:prod

db-seed-dev:
	npm run db:seed:dev

db-seed-test:
	npm run db:seed:test

db-seed-prod:
	npm run db:seed:prod

# Script commands
.PHONY: script-setup-dev script-setup-test script-setup-prod

script-setup-dev:
	chmod +x ./scripts/setup_dev_env.sh
	./scripts/setup_dev_env.sh

script-setup-test:
	chmod +x ./scripts/setup_test_env.sh
	./scripts/setup_test_env.sh

script-setup-prod:
	chmod +x ./scripts/setup_prod_env.sh
	./scripts/setup_prod_env.sh

# Combined commands
.PHONY: setup-dev setup-test setup-prod

setup-dev:
	$(MAKE) script-setup-dev

setup-test:
	$(MAKE) script-setup-test

setup-prod:
	$(MAKE) script-setup-prod

# Help
.PHONY: help

help:
	@echo "Available commands:"
	@echo "  Application:"
	@echo "    make dev         - Run app in development mode"
	@echo "    make debug       - Run app in debug mode"
	@echo "    make prod        - Run app in production mode"
	@echo "    make test        - Run tests"
	@echo "    make test-watch  - Run tests in watch mode"
	@echo "    make test-cov    - Run tests with coverage"
	@echo "    make test-e2e    - Run e2e tests"
	@echo "    make test-users-dev  - Run users module API test in development"
	@echo "    make test-users-test - Run users module API test in test environment"
	@echo "    make test-users-prod - Run users module API test in production"
	@echo "    make format      - Format code"
	@echo "    make lint        - Lint code"
	@echo "  Docker:"
	@echo "    make docker-dev-up    - Start dev database container"
	@echo "    make docker-dev-down  - Stop dev database container"
	@echo "    make docker-prod-up   - Start production containers"
	@echo "    make docker-prod-down - Stop production containers"
	@echo "  Database:"
	@echo "    make db-migrate       - Run database migrations"
	@echo "    make db-studio        - Open Prisma Studio"
	@echo "    make db-push-dev      - Push schema to dev database"
	@echo "    make db-push-test     - Push schema to test database"
	@echo "    make db-push-prod     - Push schema to production database"
	@echo "    make db-seed-dev      - Seed dev database with sample data"
	@echo "    make db-seed-test     - Seed test database with sample data"
	@echo "    make db-seed-prod     - Seed production database with sample data"
	@echo "  Script commands:"
	@echo "    make script-setup-dev  - Run development setup script"
	@echo "    make script-setup-test - Run test setup script"
	@echo "    make script-setup-prod - Run production setup script"
	@echo "  Combined:"
	@echo "    make setup-dev        - Setup development environment"
	@echo "    make setup-test       - Setup test environment"
	@echo "    make setup-prod       - Setup production environment"
