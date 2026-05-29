require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const { HttpsProxyAgent } = require('https-proxy-agent');
const logger = require('./utils/logger');
const { setupHandlers } = require('./bot/handlers');
const { startApiServer } = require('./api/server');
const { startCleanupJob } = require('./workers/cleanupWorker');
const { ensureDirectories } = require('./utils/storage');

async function main() {
  await ensureDirectories();

  // Proxy sozlamalari (Psiphon HTTP proxy)
  const botOptions = {};
  if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
    const proxyUrl = `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
    
    botOptions.telegram = {
      agent: new HttpsProxyAgent(proxyUrl),
    };
    logger.info(`HTTP proxy ishlatilmoqda: ${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`);
  }

  const bot = new Telegraf(process.env.BOT_TOKEN, botOptions);
  bot.use(session());
  setupHandlers(bot);

  startApiServer();
  startCleanupJob();

  await bot.launch();
  logger.info('🤖 Bot muvaffaqiyatli ishga tushdi!');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  logger.error('Bot ishga tushmadi:', err);
  process.exit(1);
});
