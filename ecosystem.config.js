module.exports = {
  apps: [
    {
      name: 'worker',
      script: 'server.js',
      env: {
        PORT: 7004,
        NODE_ENV: 'development'
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
