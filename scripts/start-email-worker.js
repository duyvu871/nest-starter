#!/usr/bin/env node

/**
 * Email Worker Launcher
 *
 * This script starts the email worker process that processes email jobs from the queue.
 * The worker runs independently from the main application.
 *
 * Usage:
 * npm run worker:email
 * or
 * node scripts/start-email-worker.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Email Worker...');

// Start the worker process
const workerProcess = spawn('ts-node', [
  '-r', 'tsconfig-paths/register',
  path.join(__dirname, '../src/workers/email/worker.main.ts')
], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

// Handle worker process events
workerProcess.on('close', (code) => {
  console.log(`Email worker exited with code ${code}`);
  process.exit(code);
});

workerProcess.on('error', (error) => {
  console.error('Failed to start email worker:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down worker...');
  workerProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down worker...');
  workerProcess.kill('SIGINT');
});