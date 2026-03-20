require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function testTelegram() {
  try {
    await bot.sendMessage(
      TELEGRAM_CHAT_ID,
      '✅ Job bot Telegram test successful!',
      { parse_mode: 'Markdown' }
    );
    console.log('✅ Test message sent successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testTelegram();
