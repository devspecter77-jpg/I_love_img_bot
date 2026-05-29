const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { removeBackground, compositeWithBackground } = require('../ai/processor');
const { sendPhoto, editMessage } = require('../utils/telegram');
const { getKeyboard } = require('../bot/keyboards');
const { MESSAGES } = require('../bot/messages');
const sessionManager = require('../utils/sessionManager');
const userManager = require('../utils/userManager');
const { deleteFile } = require('../utils/storage');

let botInstance = null;
function getBot() {
  if (!botInstance) {
    const { Telegraf } = require('telegraf');
    botInstance = new Telegraf(process.env.BOT_TOKEN);
  }
  return botInstance;
}

const OUTPUT_PATH = process.env.OUTPUT_PATH || './storage/output';

/**
 * mode:
 *   'remove_bg'      — faqat orqa fonni olib tashlab oq fon qo'yish
 *   'add_bg'         — bg removal yo'q, faqat fon rasmi ustiga qo'yish
 *   'remove_add_bg'  — bg olib tashlab, yangi fon qo'yish
 */
async function processImageJob(data, onProgress) {
  const { userId, sessionId, images, backgroundPath, mode, options, chatId, messageId } = data;
  const bot = getBot();
  const total = images.length;
  const outputFiles = [];

  logger.info(`Ishlov boshlandi | user=${userId} | mode=${mode} | ${total} ta rasm`);

  await editMessage(bot, chatId, messageId, MESSAGES.PROCESSING_PROGRESS(0, total));

  const userOutputDir = path.join(OUTPUT_PATH, userId.toString(), sessionId);
  if (!fs.existsSync(userOutputDir)) {
    fs.mkdirSync(userOutputDir, { recursive: true });
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const inputPath = image.localPath;

    // Kreativ emojilar
    const emojis = ['⚡️', '🔥', '✨', '💫', '⭐️', '🌟', '💥', '🎨'];
    const emoji = emojis[i % emojis.length];

    // Har rasm boshida xabar
    await editMessage(
      bot, chatId, messageId,
      `${emoji} Ishlanmoqda ${i + 1}/${total}...\n🤖 AI orqa fonni olib tashlamoqda... ${emoji}`
    );

    try {
      logger.debug(`Rasm ${i + 1}/${total}: ${path.basename(inputPath)} | mode=${mode}`);

      const outputFilename = `natija_${i + 1}_${uuidv4()}.jpg`;
      const outputPath = path.join(userOutputDir, outputFilename);

      if (mode === 'remove_bg') {
        // ── Faqat orqa fonni olib tashlab oq fon qo'yish ──
        const removedPath = path.join(userOutputDir, `removed_${uuidv4()}.png`);
        await removeBackground(inputPath, removedPath, options);
        await compositeWithBackground(removedPath, null, outputPath, {
          ...options,
          whiteBackground: true,
        });
        await deleteFile(removedPath);

      } else if (mode === 'add_bg') {
        // ── Avval bg olib tashlash, keyin yangi fon qo'yish ──
        const removedPath = path.join(userOutputDir, `removed_${uuidv4()}.png`);
        await removeBackground(inputPath, removedPath, options);
        await compositeWithBackground(removedPath, backgroundPath, outputPath, options);
        await deleteFile(removedPath);

      } else if (mode === 'remove_add_bg') {
        // ── Orqa fonni olib tashlab, yangi fon qo'yish ──
        const removedPath = path.join(userOutputDir, `removed_${uuidv4()}.png`);
        await removeBackground(inputPath, removedPath, options);
        await compositeWithBackground(removedPath, backgroundPath, outputPath, options);
        await deleteFile(removedPath);
      }

      outputFiles.push(outputPath);

      // Progress yangilash
      const progress = Math.round(((i + 1) / total) * 100);
      onProgress(progress);
      await editMessage(bot, chatId, messageId, MESSAGES.PROCESSING_PROGRESS(i + 1, total));

      // Natijani yuborish
      await sendPhoto(bot, chatId, outputPath, `✅ Rasm ${i + 1}/${total}`);

    } catch (err) {
      logger.error(`Rasm ${i + 1} ishlanmadi:`, err);
      await bot.telegram.sendMessage(chatId, MESSAGES.PROCESSING_ERROR(i + 1));
    }
  }

  // Sessionni yangilash
  sessionManager.updateSession(userId, {
    state: 'done',
    outputFiles,
  });

  // Ishlangan rasmlarni hisobga olish
  userManager.recordProcessedImages(userId, outputFiles.length);

  // Tugash xabari
  await bot.telegram.sendMessage(
    chatId,
    MESSAGES.PROCESSING_DONE(outputFiles.length),
    {
      parse_mode: 'HTML',
      ...getKeyboard('results'),
    }
  );

  // Kirish fayllarini tozalash
  for (const image of images) {
    await deleteFile(image.localPath);
  }
  if (backgroundPath) {
    await deleteFile(backgroundPath);
  }

  logger.info(`Tugadi | user=${userId} | ${outputFiles.length}/${total} muvaffaqiyatli`);
  return { success: true, outputFiles };
}

module.exports = { processImageJob };
