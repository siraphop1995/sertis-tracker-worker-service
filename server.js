const process = require('process');

app = require('./app');
cron = require('./src/utils/cornJob');
port = process.env.PORT || 3000;


//Listen port
app.listen(port, () => {
  console.log('Start listen on port: ' + port);
});
