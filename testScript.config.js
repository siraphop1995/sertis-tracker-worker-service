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
          AUTH_TOKEN:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NzQzMjUxMjh9.c-bdCvp112jf27i1T0Fy7rLOzOqYW2cLS-phkuhSvEw'
        },
        env_production: {
          PORT: 7009,
          NODE_ENV: 'production',
          autorestart: false,
          USER_SERVER: 'https://stt-user-service.herokuapp.com',
          DATE_SERVER: 'https://stt-date-service.herokuapp.com',
          LINE_SERVER: 'https://stt-line-service.herokuapp.com',
          AUTH_TOKEN:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NzQzMjUxMjh9.c-bdCvp112jf27i1T0Fy7rLOzOqYW2cLS-phkuhSvEw'
        }
      }
    ]
  };
  
