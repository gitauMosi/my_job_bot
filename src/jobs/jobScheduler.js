const schedule = require('node-schedule');
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

      // NEW: Limit to prevent rate limits
      const maxJobs = config.MAX_JOBS_PER_RUN;
      if (jobs.length > maxJobs) {
        console.log(`Limiting to top ${maxJobs} jobs`);
        jobs = jobs.slice(0, maxJobs);
      }

      console.log('Sending jobs to Telegram...');
      await telegramService.sendJobs(jobs);
      console.log('Jobs sent successfully');

    } catch (error) {
      console.error('Scheduled job ERROR:', error.message);
      console.error('Stack:', error.stack); // Full stack for debug
      await telegramService.sendErrorNotification(`${error.message}\\nStack: ${error.stack.slice(0, 500)}`);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    schedule.scheduleJob(
      { rule: config.SCHEDULE_RULE, tz: config.SCHEDULE_TIMEZONE },
      () => {
        console.log('Running scheduled job fetch...');
        this.executeJob();
      }
    );

    if (config.RUN_ON_START) {
      console.log('Running initial job fetch...');
      this.executeJob();
    }

    console.log('Job bot scheduler started.');
    console.log(`Schedule: ${config.SCHEDULE_RULE} (${config.SCHEDULE_TIMEZONE})`);
  }
}

module.exports = new JobScheduler();
