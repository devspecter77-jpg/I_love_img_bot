const cron = require('node-cron');
const logger = require('../utils/logger');
const { cleanDirectory } = require('../utils/storage');
const { cleanExpiredSessions } = require('../utils/sessionManager');

const TEMP_PATH = process.env.TEMP_PATH || './storage/temp';
const OUTPUT_PATH = process.env.OUTPUT_PATH || './storage/output';
const CLEANUP_INTERVAL = parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 60;

// Max age for temp files: 2 hours
const TEMP_MAX_AGE = 2 * 60 * 60 * 1000;
// Max age for output files: 24 hours
const OUTPUT_MAX_AGE = 24 * 60 * 60 * 1000;

function startCleanupJob() {
  // Run every hour (or configured interval)
  const cronExpression = `0 */${Math.max(1, CLEANUP_INTERVAL)} * * *`;

  cron.schedule(cronExpression, async () => {
    logger.info('Running scheduled cleanup...');

    try {
      const tempDeleted = await cleanDirectory(TEMP_PATH, TEMP_MAX_AGE);
      const outputDeleted = await cleanDirectory(OUTPUT_PATH, OUTPUT_MAX_AGE);
      const sessionsCleared = cleanExpiredSessions();

      logger.info(
        `Cleanup complete: ${tempDeleted} temp files, ${outputDeleted} output files, ${sessionsCleared} sessions removed`
      );
    } catch (err) {
      logger.error('Cleanup job error:', err);
    }
  });

  logger.info(`Cleanup job scheduled every ${CLEANUP_INTERVAL} minutes`);
}

module.exports = { startCleanupJob };
