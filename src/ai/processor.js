const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Orqa fonni AI yordamida olib tashlash
 */
async function removeBackground(inputPath, outputPath, options = {}) {
  try {
    await removeBackgroundAI(inputPath, outputPath, options);
    logger.debug(`AI bg removal OK: ${path.basename(inputPath)}`);
  } catch (err) {
    logger.warn(`AI service ishlamayapti, fallback: ${err.message}`);
    await removeBackgroundFallback(inputPath, outputPath);
  }
}

async function removeBackgroundAI(inputPath, outputPath, options = {}) {
  const form = new FormData();
  form.append('image', fs.createReadStream(inputPath));
  form.append('model', 'u2net');
  form.append('hd_mode', options.hdMode ? 'true' : 'false');

  const response = await axios.post(`${AI_SERVICE_URL}/remove-background`, form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
    timeout: 300000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));
}

async function removeBackgroundFallback(inputPath, outputPath) {
  await sharp(inputPath).png().toFile(outputPath);
}

/**
 * Rasmni fon ustiga qo'yish
 *
 * mode:
 *   whiteBackground = true  → oq fon (remove_bg)
 *   skipRemoval = true      → add_bg: fon ustiga rasm qo'yish (bg removal yo'q)
 *   (default)               → remove_add_bg: bg olib tashlangan rasm fon ustiga
 */
async function compositeWithBackground(subjectPath, backgroundPath, outputPath, options = {}) {
  logger.info(`compositeWithBackground | skipRemoval=${options.skipRemoval} | whiteBg=${options.whiteBackground} | bg=${backgroundPath ? path.basename(backgroundPath) : 'null'}`);

  // ── add_bg mode ──
  if (options.skipRemoval && backgroundPath) {
    return await addBackgroundToImage(subjectPath, backgroundPath, outputPath, options);
  }

  // ── remove_add_bg mode: fon rasmini butunligicha ishlatish ──
  if (backgroundPath && !options.whiteBackground) {
    // Fon rasmining asl o'lchamini olish
    const bgMeta = await sharp(backgroundPath).metadata();
    const bgWidth = bgMeta.width;
    const bgHeight = bgMeta.height;

    logger.info(`  Fon o'lchami (remove_add_bg): ${bgWidth}x${bgHeight}`);

    // Subject rasmini fon o'lchamiga moslashtirish (kattaroq - 85%)
    const maxSubjectWidth = Math.floor(bgWidth * 0.85);
    const maxSubjectHeight = Math.floor(bgHeight * 0.85);

    const subjectMeta = await sharp(subjectPath).metadata();
    
    // Kichik rasmlarni ham kattalashtirish
    const scale = Math.min(
      maxSubjectWidth / subjectMeta.width,
      maxSubjectHeight / subjectMeta.height
    );

    const scaledWidth = Math.round(subjectMeta.width * scale);
    const scaledHeight = Math.round(subjectMeta.height * scale);

    const subjectBuffer = await sharp(subjectPath)
      .resize(scaledWidth, scaledHeight, {
        fit: 'inside',
        // withoutEnlargement o'chirildi - kichik rasmlar ham kattalashadi
      })
      .png()
      .toBuffer();

    const offsetX = Math.round((bgWidth - scaledWidth) / 2);
    const offsetY = Math.round((bgHeight - scaledHeight) / 2);

    // Fon rasmi butunligicha, subject ustiga markazda
    const ext = path.extname(outputPath).toLowerCase();
    if (ext === '.png') {
      await sharp(backgroundPath)
        .composite([{
          input: subjectBuffer,
          left: offsetX,
          top: offsetY,
          blend: 'over',
        }])
        .png({ compressionLevel: 6 })
        .toFile(outputPath);
    } else {
      await sharp(backgroundPath)
        .composite([{
          input: subjectBuffer,
          left: offsetX,
          top: offsetY,
          blend: 'over',
        }])
        .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
        .toFile(outputPath);
    }

    logger.debug(`Composite saqlandi (remove_add_bg): ${path.basename(outputPath)}`);
    return;
  }

  // ── remove_bg mode: oq fon ──
  const subjectMeta = await sharp(subjectPath).metadata();
  const subjectWidth = subjectMeta.width;
  const subjectHeight = subjectMeta.height;

  const backgroundBuffer = await sharp({
    create: {
      width: subjectWidth,
      height: subjectHeight,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer();

  const positioned = await smartPositionSubject(subjectPath, subjectWidth, subjectHeight, options);

  const ext = path.extname(outputPath).toLowerCase();
  if (ext === '.png') {
    await sharp(backgroundBuffer)
      .composite([{
        input: positioned.scaledSubject,
        left: positioned.offsetX,
        top: positioned.offsetY,
        blend: 'over',
      }])
      .png({ compressionLevel: 6 })
      .toFile(outputPath);
  } else {
    await sharp(backgroundBuffer)
      .composite([{
        input: positioned.scaledSubject,
        left: positioned.offsetX,
        top: positioned.offsetY,
        blend: 'over',
      }])
      .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
      .toFile(outputPath);
  }

  logger.debug(`Composite saqlandi (remove_bg): ${path.basename(outputPath)}`);
}

/**
 * add_bg mode:
 * Fon rasmini asos qilib, uning ustiga kirish rasmini qo'yish.
 * Fon rasmi to'liq ko'rinadi, kirish rasmi ustiga joylashadi.
 */
/**
 * add_bg mode:
 * Fon rasmi butunligicha ko'rinadi (kesilmaydi),
 * Subject rasm fon ustiga markazda, kattaroq qilib joylashadi.
 * Kichik rasmlar ham kattalashtirilib, ko'zga ko'rinadigan qilinadi.
 */
async function addBackgroundToImage(subjectPath, backgroundPath, outputPath) {
  logger.info(`addBackgroundToImage | subject=${path.basename(subjectPath)} | bg=${path.basename(backgroundPath)}`);

  // Fon rasmining o'lchamini olish
  const bgMeta = await sharp(backgroundPath).metadata();
  const bgWidth = bgMeta.width;
  const bgHeight = bgMeta.height;

  logger.info(`  Fon o'lchami: ${bgWidth}x${bgHeight}`);

  // Subject rasmini fon o'lchamining 85% gacha kattalashtirish (kichik rasmlar ham kattalashadi)
  const maxSubjectWidth = Math.floor(bgWidth * 0.85);
  const maxSubjectHeight = Math.floor(bgHeight * 0.85);

  const subjectMeta = await sharp(subjectPath).metadata();
  
  // Kichik rasmlarni ham kattalashtirish uchun withoutEnlargement ni o'chirish
  const scale = Math.min(
    maxSubjectWidth / subjectMeta.width,
    maxSubjectHeight / subjectMeta.height
  );

  const scaledWidth = Math.round(subjectMeta.width * scale);
  const scaledHeight = Math.round(subjectMeta.height * scale);

  logger.info(`  Subject o'lchami: ${subjectMeta.width}x${subjectMeta.height} -> ${scaledWidth}x${scaledHeight} (scale: ${scale.toFixed(2)})`);

  const subjectBuffer = await sharp(subjectPath)
    .resize(scaledWidth, scaledHeight, {
      fit: 'inside',
      // withoutEnlargement o'chirildi - kichik rasmlar ham kattalashadi
    })
    .png()
    .toBuffer();

  // Subject rasmini markazga joylashtirish
  const offsetX = Math.round((bgWidth - scaledWidth) / 2);
  const offsetY = Math.round((bgHeight - scaledHeight) / 2);

  // Fon rasmi butunligicha, subject ustiga markazda
  await sharp(backgroundPath)
    .composite([{
      input: subjectBuffer,
      left: offsetX,
      top: offsetY,
      blend: 'over',
    }])
    .jpeg({ quality: 95 })
    .toFile(outputPath);

  logger.info(`add_bg composite saqlandi: ${path.basename(outputPath)}`);
}

/**
 * Subjectni markazga joylashtirish va o'lchamini moslashtirish
 */
async function smartPositionSubject(subjectPath, targetWidth, targetHeight, options = {}) {
  let trimmedBuffer, info;

  try {
    const result = await sharp(subjectPath)
      .trim({ threshold: 10 })
      .toBuffer({ resolveWithObject: true });
    trimmedBuffer = result.data;
    info = result.info;
  } catch {
    // trim ishlamasa asl rasmni ishlatish
    const result = await sharp(subjectPath).toBuffer({ resolveWithObject: true });
    trimmedBuffer = result.data;
    info = result.info;
  }

  const padding = 0.07;
  const maxWidth = Math.floor(targetWidth * (1 - padding * 2));
  const maxHeight = Math.floor(targetHeight * (1 - padding * 2));

  const scale = Math.min(maxWidth / info.width, maxHeight / info.height, 1.0);
  const scaledWidth = Math.max(Math.round(info.width * scale), 1);
  const scaledHeight = Math.max(Math.round(info.height * scale), 1);

  const scaledSubject = await sharp(trimmedBuffer)
    .resize(scaledWidth, scaledHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const offsetX = Math.round((targetWidth - scaledWidth) / 2);
  const offsetY = Math.round((targetHeight - scaledHeight) / 2);

  return { scaledSubject, offsetX, offsetY };
}

module.exports = { removeBackground, compositeWithBackground };
