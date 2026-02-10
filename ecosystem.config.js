export default {
  apps: [
    {
      name: 'jimeng-api',
      script: 'node --enable-source-maps --no-node-snapshot dist/index.js',
      args: [],
      cwd: 'e:\\360Downloads\\jimeng-api-main\\jimeng-api-main',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      env_development: {
        NODE_ENV: 'development'
      },
      log_file: 'logs/pm2-jimeng-api.log',
      error_file: 'logs/pm2-jimeng-api-error.log',
      out_file: 'logs/pm2-jimeng-api-out.log',
      pid_file: 'logs/pm2-jimeng-api.pid',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
