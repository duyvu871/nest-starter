#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up test environment..."

# Check if .env.test exists, if not create it from example
if [ ! -f .env.test ]; then
  echo "📄 Creating .env.test from .env.example..."
  cp .env.example .env.test
  
  # Modify database URL to use test database
  sed -i 's/app?schema=public/app_test?schema=public/g' .env.test
  echo "✅ Created .env.test"
else
  echo "✅ .env.test already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate
echo "✅ Prisma client generated"

# Push schema to test database
echo "📊 Pushing schema to test database..."
npm run db:push:test
echo "✅ Schema pushed to test database"

# Seed the test database
echo "🌱 Seeding test database with initial data..."
npm run db:seed:test
echo "✅ Test database seeded"

echo "🎉 Test environment setup complete!"
echo "📝 Run 'npm run test' to run tests"
