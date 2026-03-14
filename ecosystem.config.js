module.exports = {
  apps: [{
    name: 'roomchecker',
    script: './index.js',
    
    // Instances
    instances: 1,
    exec_mode: 'fork',
    
    // Auto restart
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    
    // Restart strategy
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Environment variables are loaded from .env by dotenv in the app
    
    // Error handling
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: false,
    
    // Cron restart (optional - restart every day at 3 AM)
    // cron_restart: '0 3 * * *',
    
    // Merge logs
    merge_logs: true,
    
    // PM2 Plus monitoring (optional)
    // pmx: true,
    
    // Source map support
    source_map_support: false,
    
    // Ignore watch
    ignore_watch: ['node_modules', 'logs', '*.log', 'response.html'],
    
    // Advanced features
    treekill: true,
    
    // Post-deploy hooks (optional)
    post_update: ['npm install'],
    
    // Metric monitoring
    automation: false
  }]
};
