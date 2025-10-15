
module.exports = {
  apps: [
    {
      name: 'starter-nest',
      script: 'make prod',
      max_memory_restart: '512M',
      watch: false,
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      time: true,
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'email-worker',
      script: 'make worker-email-prod',
      max_memory_restart: '256M',
      watch: false,
      log_file: './logs/email-worker.log',
      out_file: './logs/email-worker-out.log',
      error_file: './logs/email-worker-error.log',
      time: true,
      env_production: {
        NODE_ENV: 'production',
      },
    }
  ],
};