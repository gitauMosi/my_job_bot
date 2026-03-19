require('dotenv').config();
const schedule = require('node-schedule');
const { getJson } = require('serpapi');
const TelegramBot = require('node-telegram-bot-api');

// Configuration
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Job search configuration
const JOB_CONFIG = {
  engine: 'google_jobs',
  q: 'flutter developer',
  location: 'Kenya',
  google_domain: 'google.co.ke',
  hl: 'en',
  gl: 'ke',
  api_key: SERPAPI_API_KEY
};

/**
 * Fetch jobs from SerpAPI
 */
async function fetchJobs() {
  return new Promise((resolve, reject) => {
    getJson(JOB_CONFIG, (json) => {
      if (json.error) {
        reject(new Error(json.error));
      } else {
        resolve(json.jobs_results || []);
      }
    });
  });
}

/**
 * Format job message for Telegram
 */
function formatJobMessage(job, index) {
  const title = job.title || 'No title';
  const company = job.company_name || 'Unknown company';
  const location = job.location || 'Location not specified';
  const postedAt = job.detected_extensions?.posted_at || 'Date unknown';
  const scheduleType = job.detected_extensions?.schedule_type || 'Not specified';
  const salary = job.detected_extensions?.salary || 'Not specified';
  
  // Get apply links
  const applyLinks = job.apply_options || [];
  const applyText = applyLinks.length > 0
    ? applyLinks.map((option, i) => `${i + 1}. [${option.title}](${option.link})`).join('\n')
    : 'No apply links available';
  
  return `
🚀 *${index}. ${title}*

🏢 *Company:* ${company}
📍 *Location:* ${location}
📅 *Posted:* ${postedAt}
💼 *Type:* ${scheduleType}
💰 *Salary:* ${salary}

🔗 *Apply here:*
${applyText}

---
`;
}

/**
 * Send jobs to Telegram
 */
async function sendJobsToTelegram(jobs) {
  if (!jobs || jobs.length === 0) {
    await bot.sendMessage(
      TELEGRAM_CHAT_ID,
      '🤷 No new Flutter developer jobs found in Kenya today.'
    );
    return;
  }

  // Send header message
  const header = `📢 *Flutter Developer Jobs in Kenya*\n\n📊 Found *${jobs.length}* job${jobs.length > 1 ? 's' : ''} today!\n`;
  await bot.sendMessage(TELEGRAM_CHAT_ID, header, { parse_mode: 'Markdown' });

  // Send each job as a separate message
  for (let i = 0; i < jobs.length; i++) {
    const jobMessage = formatJobMessage(jobs[i], i + 1);
    
    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, jobMessage, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error sending job ${i + 1}:`, error.message);
      
      // If message is too long, send a simplified version
      if (error.message.includes('message is too long')) {
        const simplifiedMessage = `
🚀 *${i + 1}. ${job.title}*
🏢 *Company:* ${job.company_name || 'Unknown'}
📍 *Location:* ${job.location || 'Not specified'}
📅 *Posted:* ${job.detected_extensions?.posted_at || 'Unknown'}

Apply: ${job.apply_options?.[0]?.link || 'No link available'}
`;
        await bot.sendMessage(TELEGRAM_CHAT_ID, simplifiedMessage, { 
          parse_mode: 'Markdown',
          disable_web_page_preview: true 
        });
      }
    }
  }

  // Send footer message
  await bot.sendMessage(
    TELEGRAM_CHAT_ID,
    '✅ *Daily job update complete!*\nCheck back tomorrow for more opportunities.',
    { parse_mode: 'Markdown' }
  );
}

/**
 * Main function to run the job bot
 */
async function runJobBot() {
  console.log('🤖 Job bot started at:', new Date().toISOString());
  
  try {
    // Fetch jobs
    console.log('📡 Fetching jobs from SerpAPI...');
    const jobs = await fetchJobs();
    console.log(`✅ Found ${jobs.length} jobs`);
    
    // Send to Telegram
    console.log('📤 Sending jobs to Telegram...');
    await sendJobsToTelegram(jobs);
    console.log('✅ Jobs sent successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Send error notification to Telegram
    try {
      await bot.sendMessage(
        TELEGRAM_CHAT_ID,
        `⚠️ *Job Bot Error*\n\nFailed to fetch jobs: ${error.message}`,
        { parse_mode: 'Markdown' }
      );
    } catch (telegramError) {
      console.error('❌ Failed to send error notification:', telegramError.message);
    }
  }
}

// Schedule the job to run daily at 8:00 AM (Nairobi time)
// Format: second minute hour day month year (optional)
// '0 8 * * *' = Run at 8:00 AM every day
const job = schedule.scheduleJob('0 8 * * *', function() {
  console.log('⏰ Running scheduled job fetch at 8:00 AM...');
  runJobBot();
}, {
  timezone: 'Africa/Nairobi'
});

// Run immediately on start (optional)
if (process.env.RUN_ON_START === 'true') {
  console.log('🚀 Running initial job fetch...');
  runJobBot();
}

console.log('🚀 Job bot scheduler started. Waiting for 8:00 AM daily...');
console.log('📅 Current timezone: Africa/Nairobi');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Job bot stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Job bot terminated');
  process.exit(0);
});