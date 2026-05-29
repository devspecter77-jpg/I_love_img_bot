const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const TEMP_PATH = process.env.TEMP_PATH || './storage/temp';

/**
 * Download a file from Telegram servers
 * @param {object} ctx - Telegraf context
 * @param {string} fileId - Telegram file ID
 * @param {string|number} userId - User ID for folder organization
 * @param {string} type - 'subject' or 'background'
 * @returns {Promise<string>} Local file path
 */
async function downloadFile(ctx, fileId, userId, type = 'subject') {
  const fileLink = await ctx.telegram.getFileLink(fileId);
  const url = fileLink.href;

  // Determine extension from URL
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || '.jpg';

  const userDir = path.join(TEMP_PATH, userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filename = `${type}_${uuidv4()}${ext}`;
  const localPath = path.join(userDir, filename);

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
    timeout: 30000,
  });

  const writer = fs.createWriteStream(localPath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  logger.debug(`Downloaded ${type} file to ${localPath}`);
  return localPath;
}

/**
 * Send a photo to a chat
 */
async function sendPhoto(bot, chatId, filePath, caption = '') {
  return bot.telegram.sendPhoto(
    chatId,
    { source: filePath },
    { caption, parse_mode: 'HTML' }
  );
}

/**
 * Edit a message text (for progress updates)
 */
async function editMessage(bot, chatId, messageId, text) {
  try {
    await bot.telegram.editMessageText(chatId, messageId, null, text, {
      parse_mode: 'HTML',
    });
  } catch (err) {
    // Message might not have changed, ignore
    if (!err.message?.includes('message is not modified')) {
      logger.warn('Failed to edit message:', err.message);
    }
  }
}

module.exports = { downloadFile, sendPhoto, editMessage };
