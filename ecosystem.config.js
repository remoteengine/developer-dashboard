module.exports = {
  apps: [
    {
      name: 'developer-dashboard',
      script: 'server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto restart
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Monitoring
      monitoring: false,
      pmx: true,

      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 8000,
      reload_delay: 1000,

      // Environment variables
      env_file: '.env.prod',

      // Source map support
      source_map_support: true,

      // Watch and ignore
      watch: false,
      ignore_watch: ['node_modules', 'logs'],

      // Auto restart on file changes (development only)
      env_development: {
        watch: true,
        watch_delay: 1000
      }
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/developer-dashboard.git',
      path: '/var/www/developer-dashboard',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
