module.exports = {
  apps: [
    {
      name: "khelpedia",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "khelpedia-ingestion",
      script: "scripts/run_ingestion.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 */1 * * *", // Run hourly
      autorestart: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
