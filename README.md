# Roomchecker

Roomchecker periodically checks housing listings on `stwdo.de` and sends a Telegram message when an available listing is found.

## Features

- Automatic checks at fixed intervals
- Telegram notification support
- Run options with Node.js
- Continuous background execution with PM2

## Requirements

- Node.js 18+
- Telegram bot token and chat ID

## Setup

### 1) Prepare the project

```bash
npm install
```

### 2) Environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
CHECK_INTERVAL=300
NODE_ENV=production
```

## Run

### With Node.js

```bash
npm start
```

Development mode:

```bash
npm run dev
```

### With PM2

```bash
npm run pm2:start
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
```

## Find Chat ID

To get your Telegram chat ID:

```bash
node get_chat_id.js
```

## Project files

- `index.js`: Main Node.js application
- `get_chat_id.js`: Chat ID finder script
- `ecosystem.config.js`: PM2 runtime configuration
- `.env.example`: Example environment variables

## Notes

- The application reads token and chat ID values from `.env`.
- `CHECK_INTERVAL` is in seconds.
- `response.html` is used to store the latest HTTP response.
