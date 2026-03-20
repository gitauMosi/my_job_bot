const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const Formatters = require('../utils/formatters');

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: false });
    this.chatId = config.TELEGRAM_CHAT_ID;
    this.messageDelay = 1000;
  }

  async sendMessage(text, options = {}) {
    const defaultOptions = { parse_mode: 'Markdown', disable_web_page_preview: true };
    return await this.bot.sendMessage(this.chatId, text, { ...defaultOptions, ...options });
  }

  async sendJobs(jobs) {
    if (!jobs || jobs.length === 0) {
      await this.sendMessage('No new Flutter developer jobs found in Kenya today.', { parse_mode: null });
      return;
    }

    await this.sendMessage(Formatters.formatHeaderMessage(jobs.length));

    for (let i = 0; i < jobs.length; i++) {
      try {
        const jobMessage = Formatters.formatJobMessage(jobs[i], i + 1);
        await this.sendMessage(jobMessage);
        await this.delay();
      } catch (error) {
        console.error(`Error sending job ${i + 1}:`, error.message);
        
        if (error.message.includes('message is too long')) {
          const simplifiedMessage = Formatters.formatSimplifiedJobMessage(jobs[i], i);
          await this.sendMessage(simplifiedMessage);
        }
      }
    }

    await this.sendMessage('Daily job update complete!\nCheck back tomorrow for more opportunities.');
  }

  async sendErrorNotification(errorMessage) {
    try {
      await this.sendMessage(`*Job Bot Error*\n\nFailed to fetch jobs: ${errorMessage}`);
    } catch (telegramError) {
      console.error('Failed to send error notification:', telegramError.message);
    }
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, this.messageDelay));
  }
}

module.exports = new TelegramService();