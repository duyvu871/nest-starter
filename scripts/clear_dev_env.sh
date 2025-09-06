#!/bin/bash

# Exit on error
set -e

echo "🧹 Clearing development environment..."

# Stop and remove the development database container
echo "🐳 Stopping and removing development database container..."
docker-compose -f docker-compose.dev.yml --env-file .env.development down -v 2>/dev/null || true
echo "✅ Database container stopped and volumes removed"

# Check if .env.development exists
if [ -f .env.development ]; then
  echo "🗑️  Removing .env.development file..."
  rm .env.development
  echo "✅ Removed .env.development"
else
  echo "ℹ️  .env.development file not found, skipping..."
fi

# Clean Prisma generated files
if [ -d "node_modules/.prisma" ]; then
  echo "🧽 Cleaning Prisma generated files..."
  rm -rf node_modules/.prisma
  echo "✅ Prisma generated files cleaned"
fi

# Optional: Remove generated Prisma client
if [ -d "node_modules/@prisma/client" ]; then
  echo "🧽 Removing generated Prisma client..."
  rm -rf node_modules/@prisma/client
  echo "✅ Prisma client removed"
fi

# Clean dist folder if exists
if [ -d "dist" ]; then
  echo "🧽 Cleaning dist folder..."
  rm -rf dist
  echo "✅ Dist folder cleaned"
fi

# Clean logs folder if exists
if [ -d "logs" ]; then
  echo "🧽 Cleaning logs folder..."
  rm -rf logs
  echo "✅ Logs folder cleaned"
fi

echo "🎉 Development environment cleared successfully!"
echo "💡 To set up again, run: make setup-dev"
