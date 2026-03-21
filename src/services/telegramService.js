const axios = require('axios');
const config = require('../config');
const Formatters = require('../utils/formatters');

class TelegramService {
  constructor() {
    this.apiUrl = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
    this.chatId = config.TELEGRAM_CHAT_ID;
    this.messageDelay = config.MESSAGE_DELAY_MS;
    this.recentError = null; // Track for error notify skip
    this.lastErrorTime = 0;
  }

  async retrySendMessage(text, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const defaultOptions = { 
          parse_mode: 'Markdown', 
          disable_web_page_preview: true,
          ...options 
        };
        const response = await axios.post(this.apiUrl, {
          chat_id: this.chatId,
          text: text,
          ...defaultOptions
        });
        if (response.data.ok) {
          return response.data.result;
        } else {
          throw new Error(`Telegram API error: ${response.data.description}`);
        }
      } catch (error) {
        const errorMsg = error.response ? `Status ${error.response.status}: ${error.message}` : error.message;
        console.error(`Send attempt ${attempt}/${retries} failed:`, errorMsg);
        if (attempt === retries) throw error;
        // Backoff: 1s, 2s, 4s (extra for rate limit)
        const backoff = error.response?.status === 429 ? 10000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  async sendMessage(text, options = {}) {
    return await this.retrySendMessage(text, options);
  }

  async sendJobs(jobs) {
    if (!jobs || jobs.length === 0) {
      await this.sendMessage('No new Flutter developer jobs found in Kenya today.', { parse_mode: null });
      return;
    }

    const maxJobs = config.MAX_JOBS_PER_RUN;
    await this.sendMessage(Formatters.formatHeaderMessage(jobs.length));

    if (jobs.length > maxJobs) {
      // Send summary for excess
      await this.sendMessage(Formatters.formatSummaryMessage(jobs, maxJobs));
      jobs = jobs.slice(0, maxJobs); // Only detail top N
    }

    for (let i = 0; i < jobs.length; i++) {
      try {
        const jobMessage = Formatters.formatJobMessage(jobs[i], i + 1);
        await this.sendMessage(jobMessage);
        await this.delay();
      } catch (error) {
        console.error(`Failed job ${i + 1}:`, error.message, error.stack);
        if (error.message.includes('message is too long')) {
          const simplifiedMessage = Formatters.formatSimplifiedJobMessage(jobs[i], i + 1);
          await this.sendMessage(simplifiedMessage);
        }
        await this.delay();
      }
    }

    await this.sendMessage('Daily job update complete!\\nCheck back tomorrow for more opportunities.');
  }

  async sendErrorNotification(errorMessage) {
    const now = Date.now();
    if (this.recentError && (now - this.lastErrorTime) < 60000) { // Skip if error <1min ago
      console.log('Skipping error notify: recent failure');
      return;
    }
    try {
      await this.sendMessage(`*Job Bot Error*\\n\\nFailed to fetch jobs: ${errorMessage}`);
    } catch (telegramError) {
      console.error('Failed to send error notification:', telegramError.message, telegramError.stack);
      this.recentError = telegramError;
      this.lastErrorTime = now;
    }
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, this.messageDelay));
  }
}

module.exports = new TelegramService();
