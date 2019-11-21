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
        AUTH_TOKEN:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NzQzMjUxMjh9.c-bdCvp112jf27i1T0Fy7rLOzOqYW2cLS-phkuhSvEw'
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
