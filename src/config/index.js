require('dotenv').config();

module.exports = {
  SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  PORT: process.env.PORT || 3000,
  
  JOB_CONFIG: {
    engine: 'google_jobs',
    q: 'flutter developer',
    location: 'Kenya',
    google_domain: 'google.co.ke',
    hl: 'en',
    gl: 'ke',
    api_key: process.env.SERPAPI_API_KEY
  },
  
  SCHEDULE_RULE: '0 8 * * *',
  SCHEDULE_TIMEZONE: 'Africa/Nairobi',
  RUN_ON_START: process.env.RUN_ON_START === 'true'
};