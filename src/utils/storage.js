const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const DIRS = [
  process.env.STORAGE_PATH || './storage',
  process.env.TEMP_PATH || './storage/temp',
  process.env.OUTPUT_PATH || './storage/output',
  './logs',
];

async function ensureDirectories() {
  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  }
}

/**
 * Delete a file safely
 */
function deleteFile(filePath) {
  return new Promise((resolve) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        logger.warn(`Failed to delete file ${filePath}:`, err.message);
      }
      resolve();
    });
  });
}

/**
 * Delete all files in a directory older than maxAgeMs
 */
async function cleanDirectory(dirPath, maxAgeMs = 3600000) {
  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath);
  const now = Date.now();
  let deleted = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
        await deleteFile(filePath);
        deleted++;
      } else if (stat.isDirectory() && now - stat.mtimeMs > maxAgeMs) {
        fs.rmSync(filePath, { recursive: true, force: true });
        deleted++;
      }
    } catch (err) {
      logger.warn(`Error cleaning ${filePath}:`, err.message);
    }
  }

  return deleted;
}

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.size / (1024 * 1024);
  } catch {
    return 0;
  }
}

module.exports = { ensureDirectories, deleteFile, cleanDirectory, getFileSizeMB };
