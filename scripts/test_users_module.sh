#!/bin/bash

# Exit on error
set -e

# Default environment
ENV=${1:-development}

echo "🚀 Testing users module in ${ENV} environment..."

# Check if the application is running
if ! curl -s http://localhost:${PORT:-3000}/health > /dev/null; then
  echo "⚠️  Application is not running. Starting application in ${ENV} mode..."
  
  # Start application in background
  if [ "$ENV" = "development" ]; then
    npm run start:dev &
  elif [ "$ENV" = "test" ]; then
    npm run start:test &
  elif [ "$ENV" = "production" ]; then
    npm run start:prod &
  else
    echo "❌ Invalid environment: ${ENV}"
    exit 1
  fi
  
  # Save PID to kill later
  APP_PID=$!
  
  # Wait for application to start
  echo "⏳ Waiting for application to start..."
  sleep 10
  
  # Run the test
  echo "🧪 Running user module tests..."
  npm run test:users:${ENV}
  
  # Kill the application
  echo "🛑 Stopping application..."
  kill $APP_PID
else
  # Application is already running, just run the test
  echo "✅ Application is running"
  echo "🧪 Running user module tests..."
  npm run test:users:${ENV}
fi

echo "✨ Test completed!"
