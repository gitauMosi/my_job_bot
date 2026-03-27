require('dotenv').config();
const config = require('./src/config');
const { executeJob } = require('./src/jobs/jobScheduler');

async function main() {
  console.log('Cron job started:', new Date().toISOString());
  
  try {
    await executeJob();
    console.log('Cron job completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Cron job failed:', error.message);
    process.exit(1);
  }
}

// Run immediately
main();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Cron job interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cron job terminated');
  process.exit(0);
});
