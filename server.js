const express = require('express');
const config = require('./src/config');
const jobScheduler = require('./src/jobs/jobScheduler');

const app = express();

app.get('/', (req, res) => {
  res.send('Job bot is running');
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

jobScheduler.start();

process.on('SIGINT', () => {
  console.log('\nJob bot stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nJob bot terminated');
  process.exit(0);
});