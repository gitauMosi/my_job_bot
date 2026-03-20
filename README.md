<parameter name="content"># My Job Bot - Flutter Developer Jobs Telegram Bot

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-blue)](https://telegram.org/)
[![SerpAPI](https://img.shields.io/badge/SerpAPI-Jobs-orange)](https://serpapi.com/)
[![License](https://img.shields.io/badge/License-ISC-blueviolet)](LICENSE)

## Description

**My Job Bot** is an automated Node.js Telegram bot that **daily fetches Flutter developer job listings** from Google Jobs via [SerpAPI](https://serpapi.com/), beautifully formats them in Markdown, and sends them directly to your Telegram chat.

**Key Features:**
- **Daily Scheduling**: Runs automatically at **8:00 AM EAT (Nairobi timezone)**.
- **Rich Formatting**: Beautiful Markdown messages with job title, company, location, salary, apply links.
- **Concurrent Prevention**: Skips duplicate runs to avoid spam.
- **Error Handling**: Sends error notifications if jobs fail to fetch/send.
- **Health Check**: Express server endpoint `/` for monitoring.
- **Instant Test**: `npm test` sends test message to Telegram.
- **Configurable**: Easy `.env` setup for API keys, schedule, query.

## Demo Output

The bot sends messages like:
```
*Flutter Developer Jobs*

Found *5* jobs today!

*1. Senior Flutter Developer*

*Company:* ABC Tech Ltd
*Location:* Nairobi, Kenya
*Posted:* 2 days ago
*Type:* Full-time
*Salary:* KSh 150,000 - 250,000/month

*Apply here:*
1. [Easy Apply](https://apply.com/job1)
---
```

## Quick Start

### Prerequisites
- Node.js 18+
- [SerpAPI Key](https://serpapi.com/users/sign_up) (free tier available)
- Telegram [@BotFather](https://t.me/botfather) bot token + your Chat ID

### 1. Clone & Install
```bash
git clone <repo> my-job-bot
cd my-job-bot
npm install
```

### 2. Setup `.env`
Create `.env` file:
```env
# Required APIs
SERPAPI_API_KEY=your_serpapi_key_here
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Optional
PORT=3000
RUN_ON_START=true

# Job Query (customize as needed)
# See config/index.js for JOB_CONFIG
```

**Get Chat ID**: Message [@userinfobot](https://t.me/userinfobot) or [@chatid_echo_bot](https://t.me/chatid_echo_bot).

### 3. Test & Run
```bash
# Test Telegram connection
npm test

# Development (auto-restart)
npm run dev

# Production
npm start
```

Visit `http://localhost:3000` to confirm: **"Job bot is running"**.

## Configuration

All config in `src/config/index.js`:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERPAPI_API_KEY` | SerpAPI key | Required |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | Required |
| `TELEGRAM_CHAT_ID` | Your chat/group ID | Required |
| `PORT` | Server port | 3000 |
| `RUN_ON_START` | Run job immediately on start | false |

**Job Search Config** (`JOB_CONFIG`):
```js
{
  engine: 'google_jobs',
  q: 'flutter developer',
  location: 'Kenya',
  google_domain: 'google.co.ke',
  hl: 'en',
  gl: 'ke'
}
```
Customize query/location in `src/config/index.js`.

**Schedule**: `0 8 * * *` (8AM daily), timezone `Africa/Nairobi`. Edit `SCHEDULE_RULE` in config.

## Project Structure
```
my-job-bot/
├── server.js           # Express server + scheduler start
├── package.json        # Dependencies & scripts
├── src/
│   ├── config/         # .env + JOB_CONFIG
│   ├── services/       # JobService (SerpAPI), TelegramService
│   ├── utils/          # Message formatters
│   └── jobs/           # JobScheduler (cron)
├── test.js             # Telegram test
└── README.md
```

## Architecture

```
.env → Config → JobService(SerpAPI) → Jobs Data
                           ↓
JobScheduler(cron 8AM) → TelegramService → Formatted Messages → Your Chat
                           ↓
server.js (Express / health) + graceful shutdown
```

**Flow**:
1. `npm start` → `server.js` → starts Express + `jobScheduler.start()`
2. Scheduler runs daily → `jobService.fetchJobs()` → SerpAPI
3. `telegramService.sendJobs()` → formats + sends (1s delay between jobs)
4. Errors → `sendErrorNotification()`

## API Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check: \"Job bot is running\" |

## Testing
```bash
npm test  # Sends test message to Telegram
```

## Deployment
1. Set `.env` on server
2. `npm install --production`
3. `npm start` or PM2: `pm2 start server.js --name job-bot`
4. Monitor logs + `/` endpoint.

**Docker** (optional):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
CMD [\"npm\", \"start\"]
```

## Troubleshooting
- **No jobs**: Check SerpAPI key/quota, query params.
- **Telegram errors**: Verify BOT_TOKEN/CHAT_ID, bot added to group.
- **Missed schedule**: Check timezone, `RUN_ON_START=true`.
- **Concurrent runs**: Built-in lock prevents spam.
- Logs: Console output details fetch/send status.

## Contributing
1. Fork & PR
2. Add features: custom queries, more engines, web dashboard.
3. Issues: SerpAPI limits, Telegram message length.

##  License
ISC License - see [LICENSE](LICENSE) or package.json.

## Acknowledgments
- [SerpAPI](https://serpapi.com/)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [node-schedule](https://github.com/node-schedule/node-schedule)

**Happy Job Hunting! **
⭐ Star if useful!
</parameter>
