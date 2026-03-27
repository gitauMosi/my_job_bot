const config = require('../config');
const jobService = require('../services/jobService');
const telegramService = require('../services/telegramService');

class JobScheduler {
  constructor() {
    this.isRunning = false;
  }

  async executeJob() {
    if (this.isRunning) {
      console.log('Job already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Job bot started at:', new Date().toISOString());

    try {
      console.log('Fetching jobs from SerpAPI...');
      let jobs = await jobService.fetchJobs();
      console.log(`Found ${jobs.length} jobs`);

      const maxJobs = config.MAX_JOBS_PER_RUN;
      if (jobs.length > maxJobs) {
        console.log(`Limiting to top ${maxJobs} jobs`);
        jobs = jobs.slice(0, maxJobs);
      }

      console.log('Sending jobs to Telegram...');
      await telegramService.sendJobs(jobs);
      console.log('Jobs sent successfully');

    } catch (error) {
      console.error('Job ERROR:', error.message);
      console.error('Stack:', error.stack);
      await telegramService.sendErrorNotification(`${error.message}\\nStack: ${error.stack.slice(0, 500)}`);
    } finally {
      this.isRunning = false;
    }
  }
}

async function executeJob() {
  const scheduler = new JobScheduler();
  return await scheduler.executeJob();
}

module.exports = { executeJob };
