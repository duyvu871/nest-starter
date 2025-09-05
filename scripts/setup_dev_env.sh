#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up development environment..."

# Check if .env.development exists, if not create it from example
if [ ! -f .env.development ]; then
  echo "📄 Creating .env.development from .env.example..."
  cp .env.example .env.development
  echo "✅ Created .env.development"
else
  echo "✅ .env.development already exists"
fi

# Start the development database
echo "🐳 Starting development database container..."
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
echo "✅ Database container started"

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate
echo "✅ Prisma client generated"

# Push schema to database
echo "📊 Pushing schema to database..."
npm run db:push:dev
echo "✅ Schema pushed to database"

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run db:seed:dev
echo "✅ Database seeded"

echo "🎉 Development environment setup complete!"
echo "📝 Run 'npm run start:dev' to start the application"
