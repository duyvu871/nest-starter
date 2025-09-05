# Basic POS System

A basic point-of-sale system built with NestJS, Prisma, and PostgreSQL.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker and Docker Compose
- Make (optional, for using Makefile commands)

## Environment Setup

The application uses different environment files based on the NODE_ENV:
- `.env.development` - Development environment
- `.env.test` - Test environment
- `.env.production` - Production environment

### Creating Environment Files

Copy the example environment file and create your environment-specific files:

```bash
cp .env.example .env.development
cp .env.example .env.test
cp .env.example .env.production
```

### Environment Configuration

Each environment file should contain the following variables:

```
# Environment
NODE_ENV=development  # or test, production

# Application
APP_NAME=nest-basic-prisma
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
```

For the test environment, you might want to use a different database:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_test?schema=public"
```

For production, you might want to use different credentials and port:

```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5554/app?schema=public"
```

## Project Structure

The project follows a standard NestJS structure with some additional directories:

```
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── scripts/              # Utility scripts
│   ├── setup_dev_env.sh  # Development setup script
│   ├── setup_test_env.sh # Test setup script
│   └── setup_prod_env.sh # Production setup script
├── src/
│   ├── common/           # Common utilities, filters, interceptors
│   ├── config/           # Configuration modules
│   ├── prisma/           # Prisma service module
│   ├── users/            # Users module
│   ├── app.module.ts     # Main application module
│   └── main.ts           # Application entry point
└── test/                 # E2E tests
```

## Quick Start

### Using the Setup Script

The easiest way to get started is using our setup script:

```bash
# Make the script executable
chmod +x ./scripts/setup_dev_env.sh

# Run the setup script
./scripts/setup_dev_env.sh
```

This script will:
1. Start the development database container
2. Push the Prisma schema to the database
3. Seed the database with sample data

### Using Make Commands

If you have Make installed, you can use the following commands:

```bash
# Setup the entire development environment (database, schema, seed data)
make setup-dev

# Start only the development database
make docker-dev-up

# Push the schema to the database
make db-push-dev

# Seed the database with sample data
make db-seed-dev

# Start the application in development mode
make dev
```

### Manual Setup

If you prefer to run commands manually:

```bash
# Start the development database
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# Generate Prisma client
npm run prisma:generate

# Push the schema to the database
npm run db:push:dev

# Seed the database
npm run db:seed:dev

# Start the application
npm run start:dev
```

## Database Management

The application uses PostgreSQL as the database and Prisma as the ORM.

### Prisma Commands

```bash
# Open Prisma Studio (database GUI)
make db-studio
# or
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Push schema changes without migrations
npm run db:push:dev
```

## Running the Application

```bash
# Development mode
make dev
# or
npm run start:dev

# Debug mode
make debug
# or
npm run start:debug

# Production mode
make prod
# or
npm run start:prod
```

## Testing

### Unit and E2E Tests

```bash
# Unit tests
make test
# or
npm run test

# E2E tests
make test-e2e
# or
npm run test:e2e

# Test coverage
make test-cov
# or
npm run test:cov
```

### API Testing

The project includes a script to test the Users API endpoints:

```bash
# Test users module API in development environment
make test-users-dev
# or
npm run test:users:dev

# Test users module API in test environment
make test-users-test
# or
npm run test:users:test

# Test users module API in production environment
make test-users-prod
# or
npm run test:users:prod
```

You can also use the shell script that handles starting the application if needed:

```bash
# Make the script executable
chmod +x ./scripts/test_users_module.sh

# Run the test (default: development environment)
./scripts/test_users_module.sh

# Run the test in a specific environment
./scripts/test_users_module.sh test
./scripts/test_users_module.sh production
```

## Docker

The development environment uses Docker only for the database, while the application runs directly on the host machine. For production, both the application and database run in Docker containers.

### Development

```bash
# Start development database
make docker-dev-up
# or
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# Stop development database
make docker-dev-down
# or
docker-compose -f docker-compose.dev.yml --env-file .env.development down
```

### Production

```bash
# Start production containers
make docker-prod-up
# or
docker-compose --env-file .env.production up -d

# Stop production containers
make docker-prod-down
# or
docker-compose --env-file .env.production down
```
