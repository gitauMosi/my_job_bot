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
      const jobs = await jobService.fetchJobs();
      console.log(`Found ${jobs.length} jobs`);

      console.log('Sending jobs to Telegram...');
      await telegramService.sendJobs(jobs);
      console.log('Jobs sent successfully');

    } catch (error) {
      console.error('Error:', error.message);
      await telegramService.sendErrorNotification(error.message);
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