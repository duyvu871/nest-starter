#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up production environment..."

# Check if .env.production exists, if not create it from example
if [ ! -f .env.production ]; then
  echo "📄 Creating .env.production from .env.example..."
  cp .env.example .env.production
  
  # Set NODE_ENV to production
  sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env.production
  echo "✅ Created .env.production"
else
  echo "✅ .env.production already exists"
fi

# Start the production containers
echo "🐳 Starting production containers..."
docker-compose --env-file .env.production up -d
echo "✅ Production containers started"

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate
echo "✅ Prisma client generated"

# Push schema to database
echo "📊 Pushing schema to production database..."
npm run db:push:prod
echo "✅ Schema pushed to production database"

# Seed the database
echo "🌱 Seeding production database with initial data..."
npm run db:seed:prod
echo "✅ Production database seeded"

echo "🎉 Production environment setup complete!"
echo "📝 Run 'npm run start:prod' to start the application in production mode"
