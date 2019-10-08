module.exports = {
  apps: [
    {
      name: 'worker',
      script: 'server.js',
      env: {
        PORT: 7002,
        NODE_ENV: 'development',
        MONGO_URL: 'mongodb://localhost:27017/stt'
      },
      env_production: {
        PORT: 7002,
        NODE_ENV: 'production',
        MONGO_URL:
          'mongodb+srv://admin:admin@cluster0-mnunz.gcp.mongodb.net/line?retryWrites=true&w=majority'
      }
    }
  ].map(service => {
    service.watch = true;
    service.instances = 1;
    service.exec_mode = 'cluster';
    return service;
  })
};
