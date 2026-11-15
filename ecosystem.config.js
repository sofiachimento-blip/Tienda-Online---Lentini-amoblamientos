module.exports = {
  apps: [
    {
      name: "lentini-servidor",
      script: "./server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};