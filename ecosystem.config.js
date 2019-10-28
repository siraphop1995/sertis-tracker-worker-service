module.exports = {
  apps: [
    {
      name: 'worker',
      script: 'server.js',
      env: {
        PORT: 7004,
        NODE_ENV: 'development',
        USER_SERVER: 'http://localhost:7001',
        DATE_SERVER: 'http://localhost:7002',
        LINE_SERVER: 'http://localhost:7003',
      },
      env_production: {
        PORT: 7004,
        NODE_ENV: 'production'
      }
    }
  ].map(service => {
    service.watch = true;
    service.instances = 1;
    service.exec_mode = 'cluster';
    return service;
  })
};
