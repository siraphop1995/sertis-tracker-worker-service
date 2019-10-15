const process = require('process');
const errorHandler = require('./src/utils/errorHandler');

app = require('./app');
cron = require('./src/utils/cornJob');
port = process.env.PORT || 3000;

//custom error handler middleware
app.use(errorHandler);

//Listen port
app.listen(port, () => {
  console.log('Start listen on port: ' + port);
});
