# NestJS Starter with Authentication & User Management

A comprehensive NestJS starter project with JWT authentication, user management, email services, and modern development practices.

## Features

- **Authentication & Authorization**
  - JWT access/refresh tokens with secure cookie handling
  - Role-based access control (Admin, Staff, User)
  - Email verification and password reset
  - Rate limiting for auth endpoints

- **User Management**
  - Full CRUD operations for users
  - Admin-only user management endpoints
  - User roles and status management

- **Email Integration**
  - SMTP email service with Handlebars templates
  - Verification and password reset emails
  - Configurable email providers

- **Database & ORM**
  - Prisma ORM with PostgreSQL
  - Database migrations and seeding
  - Health checks for database connectivity

- **Development Tools**
  - Hot reload development setup
  - Docker Compose for database
  - Comprehensive health checks
  - API response decorators
  - Path aliases for clean imports

- **Security & Performance**
  - Rate limiting with @nestjs/throttler
  - CORS configuration
  - Input validation with class-validator
  - Bcrypt password hashing

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker and Docker Compose
- Make (optional, for using Makefile commands)

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
NODE_ENV=development

# Application
APP_NAME=nest-starter
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=app
DB_SCHEMA=public
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="${APP_NAME} <${SMTP_USER}>"
EMAIL_TEMPLATES_PATH=src/module/email/templates

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Security
BCRYPT_ROUNDS=12

# Health Checks
HEALTH_ENDPOINTS_ENABLED=false

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

## Project Structure

The project follows a modular NestJS architecture:

```
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema with User model
├── scripts/              # Utility scripts for setup
├── src/
│   ├── common/           # Shared utilities and decorators
│   │   ├── decorators/   # Custom decorators (roles, public, API responses)
│   │   ├── filters/      # Exception filters
│   │   ├── helpers/      # Utility services (bcrypt, code generation)
│   │   ├── interceptors/ # HTTP interceptors (logging, response)
│   │   ├── logger/       # Logging system
│   │   ├── response/     # Response types and success/error classes
│   │   └── types/        # TypeScript type definitions
│   ├── config/           # Configuration modules (JWT, email, database)
│   ├── module/           # Feature modules
│   │   ├── auth/         # Authentication module
│   │   │   ├── dto/      # Data transfer objects
│   │   │   ├── guards/   # JWT and roles guards
│   │   │   └── token.service.ts # JWT token management
│   │   ├── email/        # Email service with templates
│   │   ├── health/       # Health check indicators
│   │   ├── jobs/         # Background jobs
│   │   └── user/         # User management module
│   ├── app.module.ts     # Main application module
│   └── main.ts           # Application entry point
├── test/                 # E2E tests
└── public/               # Static assets and email templates
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

### Clearing Development Environment

If you want to completely clean up your development environment, you can use the clear script:

```bash
# Make the script executable
chmod +x ./scripts/clear_dev_env.sh

# Run the clear script
./scripts/clear_dev_env.sh
```

Or using Make:

```bash
make clear-dev
```

This script will:
1. **Remove** `.env.development` file
2. **Stop and remove** the development database container with volumes
3. **Clean** Prisma generated files
4. **Clean** `dist` folder
5. **Clean** `logs` folder

**⚠️ WARNING:** This will permanently delete your development database data and configuration!

### Using Make Commands

If you have Make installed, you can use the following commands:

```bash
# Setup the entire development environment (database, schema, seed data)
make setup-dev

# Clear the entire development environment
make clear-dev

# Start only the development database
make docker-dev-up

# Push the schema to the database
make db-push-dev

# Reset and recreate database with fresh schema and seed data (no confirmation)
make db-reset-dev

# Reset database with user confirmation prompt
make db-reset-force

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

# Reset and recreate database with fresh schema and seed data (no confirmation)
npm run prisma:migrate:reset:force

# Reset database with user confirmation prompt
npm run prisma:migrate:reset

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

# Reset and recreate database (⚠️ WARNING: This will delete all data!)
npm run prisma:migrate:reset:force
```

### Database Reset Commands

The project provides two database reset commands with different confirmation behaviors:

#### 1. Force Reset (No Confirmation)

```bash
# Using Make
make db-reset-dev

# Using npm directly
npm run prisma:migrate:reset:force
```

**What it does:**
1. **Drops all tables** in the database
2. **Recreates the database schema** from your Prisma schema
3. **Runs the seed script** to populate with sample data

**⚠️ WARNING:** This command will **permanently delete all data** without asking for confirmation!

#### 2. Interactive Reset (With Confirmation)

```bash
# Using Make
make db-reset-confirm

# Using npm directly
npm run prisma:migrate:reset
```

**What it does:**
- Shows a **confirmation prompt** asking if you want to continue
- Displays **warning messages** about data loss
- Only proceeds if you type `yes` or `y`
- Same database operations as the force reset if confirmed

**Example output:**
```
🚨 WARNING: Database Reset Operation
==================================================

This action will:
  ❌ Delete ALL data in your database
  ❌ Drop all tables
  ✅ Recreate database schema from Prisma schema
  ✅ Run seed script to populate sample data

This operation cannot be undone!

Are you sure you want to continue? (yes/no):
```

#### When to use each command:

**Use `db-reset-dev` (force):**
- In automated scripts or CI/CD pipelines
- When you need non-interactive operation
- When you're absolutely sure you want to reset

**Use `db-reset-force` (interactive):**
- Force reset with no warning

**Note:** Both commands only work in development environment and use the `.env.development` file.

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

## Security Features

### Rate Limiting

The application uses `@nestjs/throttler` for rate limiting to prevent abuse:

- **Global Rate Limiting**: 100 requests per minute (configurable via `RATE_LIMIT_MAX`)
- **Auth Endpoints**: Specific limits for authentication operations
  - Register: 5 requests/minute
  - Login: 10 requests/minute
  - Email verification: 5 requests/minute
  - Password reset: 3 requests/minute

### Authentication & Authorization

- **JWT Tokens**: Access and refresh tokens with secure cookie handling
- **Role-Based Access**: Three user roles (ADMIN, STAFF, USER)
- **Email Verification**: Required for account activation
- **Password Security**: Bcrypt hashing with configurable rounds
- **Secure Cookies**: httpOnly, secure, sameSite cookies for refresh tokens

### Input Validation

- **Class Validator**: DTOs with validation decorators
- **Custom Validators**: Match decorator for password confirmation
- **Type Safety**: Full TypeScript support with strict mode

### CORS Configuration

Configurable CORS origins for cross-origin requests:

```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

### Development

```bash
# Run Tailwind in watch mode (auto-rebuild on changes)
make tw-dev
# or
npm run tw:dev

# Run full development (NestJS + Tailwind auto-reload)
make dev-full
# or
npm run dev:full
```

### Building

```bash
# Build Tailwind for production (minified)
make tw-build
# or
npm run tw:build

# Build Tailwind for development (non-minified)
make tw-build-dev
# or
npm run tw:build:dev

# Build full application (Tailwind + NestJS)
make build-full
# or
npm run build:full
```

### Utilities

```bash
# Clean Tailwind output file
make tw-clean
# or
npm run tw:clean

# Build with content purging (removes unused CSS)
make tw-purge
# or
npm run tw:purge
```

### Configuration

Tailwind is configured in `tailwind.config.mts` with content paths for:
- `src/**/*.ts` - TypeScript files
- `views/**/*.hbs` - Handlebars templates
- `views/**/*.ejs` - EJS templates
- `src/docs/templates/**/*.hbs` - Documentation templates
- `public/**/*.html` - Static HTML files

## Documentation Templates

The project includes styled Handlebars templates for documentation:

### Sidebar Features

- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode**: Automatic dark/light theme support
- **Category Grouping**: Organized navigation with folder icons
- **Active States**: Visual indication of current page
- **Search Bar**: Quick navigation through documentation
- **Smooth Animations**: Enhanced user experience
- **Accessibility**: Screen reader support and keyboard navigation

### Template Structure

```
src/docs/templates/
├── layout.hbs          # Main layout with sidebar
└── partials/
    └── sidebar.hbs     # Navigation sidebar component
```

### Custom Styling

Additional CSS is available in `public/assets/css/sidebar.css` for:
- Custom scrollbars
- Mobile responsiveness
- Animation effects
- High contrast mode support
- Print-friendly styles

### Demo

View the styled sidebar demo at `/demo-sidebar.html` when running the application.

## API Documentation

### Authentication Endpoints

All auth endpoints are rate-limited to prevent abuse.

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "usernameOrEmail": "johndoe",
  "password": "password123"
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

#### Resend Verification Email
```http
POST /auth/reverify-email
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "resetToken": "123456",
  "password": "newpassword123"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
```
*Uses refresh token from httpOnly cookie*

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

### User Management Endpoints (Admin Only)

#### Get All Users
```http
GET /users
Authorization: Bearer <admin_access_token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <admin_access_token>
```

#### Update User
```http
PUT /users/:id
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "STAFF",
  "status": "ACTIVE"
}
```

#### Delete User
```http
DELETE /users/:id
Authorization: Bearer <admin_access_token>
```

### Health Check Endpoints

#### Basic Health
```http
GET /health
```

#### Database Health
```http
GET /health/database
```

#### System Health
```http
GET /health/system
```

### Rate Limiting

Auth endpoints are protected with rate limiting:
- Register: 5 requests per minute
- Login: 10 requests per minute
- Email verification: 5 requests per minute
- Password reset: 3 requests per minute

Global rate limiting: 100 requests per minute (configurable via `RATE_LIMIT_MAX`)

## Response Types Architecture

The project uses a unified type system for all response-related functionality:

### Core Response Types (`src/common/types/response.types.ts`)

- **`BaseResponse`**: Base interface for all API responses
- **`SuccessResponse<T>`**: Interface for successful responses
- **`ErrorResponse`**: Interface for error responses
- **`PaginatedSuccessResponse<T>`**: Interface for paginated responses
- **`RawResponse<T>`**: Interface for bypassing response wrapping
- **`ApiResponseOptions`**: Configuration options for decorators
- **`ApiResponseMetadata`**: Metadata types for decorator system

## API Response Decorators

The project includes powerful decorators to automatically wrap API responses with `ApiResponse.success()`. These decorators provide a clean and declarative way to customize API responses.

### Available Decorators

#### `@ApiSuccess(message?, options?)`
Automatically wraps responses with `ApiResponse.success()` and custom message.

```typescript
@ApiSuccess('User created successfully')
@Post('users')
async createUser(@Body() data: CreateUserDto) {
  return await this.userService.create(data);
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": 1, "username": "johndoe" }
}
```

#### `@ApiResponse(statusCode, message?, options?)`
Creates custom responses with specific HTTP status codes.

```typescript
@ApiResponse(201, 'Resource created successfully')
@Post('resources')
async createResource(@Body() data: any) {
  return await this.resourceService.create(data);
}
```

#### `@ApiError(message?, statusCode?)`
Creates error responses with custom messages and status codes.

```typescript
@ApiError('Validation failed', 400)
@Post('validate')
async validateData(@Body() data: any) {
  if (!data.username) {
    throw new Error('Username is required');
  }
  return { valid: true };
}
```

#### `@RawResponse()`
Bypasses automatic `ApiResponse` wrapping for raw responses.

```typescript
@RawResponse()
@Get('file')
async getFile() {
  return this.fileService.getFileStream();
}
```

### Advanced Options

#### Custom Metadata
```typescript
@ApiSuccess('Data retrieved', {
  metadata: { total: 100, page: 1 },
  statusCode: 200,
  includeRequestId: true
})
```

#### Custom Headers
```typescript
@ApiSuccess('Data with headers', {
  headers: {
    'X-Custom-Header': 'value',
    'Cache-Control': 'no-cache'
  }
})
```

#### Response Transformation
```typescript
@ApiSuccess('Transformed data', {
  transform: (response) => ({
    ...response,
    timestamp: new Date().toISOString()
  })
})
```

### Priority Order

When multiple decorators are applied to the same method, they are processed in this order:
1. `@RawResponse()` - Bypasses all wrapping
2. `@ApiError()` - Creates error response
3. `@ApiResponse()` - Creates custom response
4. `@ApiSuccess()` - Creates success response
5. Default wrapping - Standard `ApiResponse.success()`

## Development Tools

### Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
// Instead of relative imports
import { ApiSuccess } from '../../common/decorators';

// Use path aliases
import { ApiSuccess } from 'common/decorators';
```

Configured aliases in `tsconfig.json`:
- `app/*` → `./src/*`
- `common/*` → `./src/common/*`
- `config/*` → `./src/config/*`
- `module/*` → `./src/module/*`

### Hot Reload & Development

- **Auto-reload**: Changes trigger automatic server restart
- **Source Maps**: Full debugging support
- **TypeScript**: Strict mode with incremental compilation

### Docker Integration

- **Development**: Database runs in Docker, app runs locally
- **Production**: Full containerization with Docker Compose
- **Database**: PostgreSQL with persistent volumes

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

## Git Hooks with Husky

The project uses [Husky](https://typicode.github.io/husky/) to enforce code quality and consistency through Git hooks. These hooks run automatically at specific points in the Git workflow.

### Available Hooks

1. **pre-commit**: Runs before each commit
   - Executes `npm run lint` to ensure code follows style guidelines
   - Prevents commits with linting errors

2. **commit-msg**: Validates commit message format
   - Enforces [Conventional Commits](https://www.conventionalcommits.org/) format
   - Ensures commit messages are descriptive and follow a standard pattern

3. **pre-push**: Runs before pushing to remote
   - Executes `npm run build` to ensure code builds successfully
   - Prevents pushing code that doesn't compile

### Commit Message Format

Commit messages must follow this format:

```
type(scope?): description
```

Where:
- **type**: The type of change (required)
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `test`: Adding or updating tests
  - `chore`: Changes to the build process or auxiliary tools
  - `perf`: Performance improvements
  - `ci`: CI configuration changes
  - `build`: Changes that affect the build system
  - `revert`: Reverting a previous commit

- **scope**: The scope of the change (optional)
  - Should be a noun describing a section of the codebase (e.g., `auth`, `users`, `database`)
  - Must contain only lowercase letters, numbers, and hyphens

- **description**: A short description of the change (required)
  - Should be concise (max 200 characters)
  - Written in imperative mood ("add feature" not "added feature")

### Examples of Valid Commit Messages

```
feat(auth): add login functionality
fix(users): resolve issue with user registration
docs: update README with setup instructions
style: format code according to style guide
refactor(database): improve query performance
test(api): add tests for user endpoints
chore: update dependencies
```

### Breaking Changes

For breaking changes, add an exclamation mark before the colon:

```
feat(api)!: change response format of user endpoints
```

## Health Checks

The application includes comprehensive health check endpoints for monitoring and diagnostics. The health module provides multiple endpoints to check various aspects of the system.

### Health Check Endpoints

#### Basic Health Check
```bash
GET /health
```

Returns basic health status including system, memory, and application status.

#### Detailed Health Check
```bash
GET /health/detailed
```

Comprehensive health check including database, memory, and disk usage.

#### Specific Health Checks
```bash
GET /health/database    # Database connectivity
GET /health/memory      # Memory usage
GET /health/live        # Liveness probe
GET /health/ready       # Readiness probe
GET /health/system      # System information
GET /health/metrics     # Prometheus metrics
```

### Health Check Response

**Healthy Response:**
```json
{
  "status": "ok",
  "info": {
    "system": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "heapUsed": 45000000,
      "heapUsedMB": 43
    },
    "memory_rss": {
      "status": "up",
      "rss": 120000000,
      "rssMB": 114
    }
  },
  "details": {
    "system": {
      "status": "up",
      "platform": "linux",
      "uptime": 3600
    }
  }
}
```

**Unhealthy Response:**
```json
{
  "status": "error",
  "error": {
    "database": {
      "status": "down",
      "error": "Connection timeout"
    }
  }
}
```

### Health Indicators

The health module includes several indicators:

- **DatabaseHealthIndicator**: Checks database connectivity and query performance
- **MemoryHealthIndicator**: Monitors heap and RSS memory usage
- **DiskHealthIndicator**: Checks disk space and file system permissions
- **SystemHealthIndicator**: Monitors system load, uptime, and process health

### Configuration

#### Environment Variables

Control health endpoints visibility in production:

```bash
# Enable detailed health endpoints in production
HEALTH_ENDPOINTS_ENABLED=true

# Default: false (only /health/live available in production)
HEALTH_ENDPOINTS_ENABLED=false
```

#### Health Check Thresholds

Health check thresholds can be configured in the health indicators:

```typescript
// Memory threshold (150MB)
() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024)

// Disk usage threshold (90%)
() => this.disk.checkStorage('storage', {
  path: process.cwd(),
  thresholdPercent: 90
})
```

#### Production Setup

In production, only the `/health/live` endpoint is available by default for security:

```bash
# ✅ Always available in production
GET /health/live

# ❌ Disabled in production (returns error)
GET /health
GET /health/detailed
GET /health/database
GET /health/memory
GET /health/system
GET /health/ready
GET /health/metrics
```

To enable detailed endpoints in production:

```bash
# Set in your production environment
HEALTH_ENDPOINTS_ENABLED=true
```

**Security Best Practice:** Keep `HEALTH_ENDPOINTS_ENABLED=false` in production to minimize information disclosure.

### Kubernetes Integration

The health endpoints are designed for Kubernetes liveness and readiness probes:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Monitoring Integration

The `/health/metrics` endpoint provides Prometheus-compatible metrics for monitoring systems.

### Custom Health Checks

You can extend the health module by creating custom health indicators:

```typescript
@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  async checkCustom(key: string): Promise<HealthIndicatorResult> {
    // Your custom health check logic
    return this.getStatus(key, isHealthy, { /* details */ });
  }
}
```

## Quick Start Summary

This NestJS starter provides everything you need to build a secure, scalable application:

### 🚀 **Ready-to-Use Features**
- **Complete Authentication System** with JWT, email verification, and role-based access
- **User Management** with full CRUD operations and admin controls
- **Email Integration** with SMTP and Handlebars templates
- **Database Layer** with Prisma ORM and PostgreSQL
- **Security Features** including rate limiting, CORS, and input validation
- **Health Monitoring** with comprehensive system checks
- **Development Tools** with hot reload, Docker, and path aliases

### 🛠 **Quick Setup**
```bash
# Clone and setup
make setup-dev

# Start developing
make dev
```

### 📚 **API Endpoints Ready**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users` - List users (Admin)
- `GET /health` - System health check

### 🔧 **Configuration**
- Environment-based config with validation
- JWT secrets and email SMTP settings
- Rate limiting and CORS configuration
- Database connection and migrations

### 🧪 **Testing & Quality**
- Unit and E2E test setup
- API testing scripts
- Git hooks with Husky
- ESLint and Prettier configuration

This starter gives you a production-ready foundation with modern best practices, saving weeks of initial setup time. Start building your features on top of this solid base!