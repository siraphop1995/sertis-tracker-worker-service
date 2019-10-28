module.exports = {
    apps: [
      {
        name: 'test',
        script: 'testScript.js',
        // watch:true,
        env: {
          PORT: 7004,
          NODE_ENV: 'development',
          autorestart: false,
          USER_SERVER: 'http://localhost:7001',
          DATE_SERVER: 'http://localhost:7002',
          LINE_SERVER: 'http://localhost:7003',
        }
      }
    ]
  };
  
