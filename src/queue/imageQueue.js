/**
 * In-memory queue — Redis talab qilmaydi
 * Bir vaqtda 2 ta rasm parallel ishlanadi
 */
const logger = require('../utils/logger');
const { processImageJob } = require('../workers/imageWorker');

const queue = [];
let activeJobs = 0;
const MAX_CONCURRENT = 2;

async function addToQueue(jobData) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  logger.info(`Navbatga qo'shildi: ${jobId} | user=${jobData.userId}`);
  queue.push({ id: jobId, data: jobData });
  processNext();
  return jobId;
}

async function processNext() {
  if (activeJobs >= MAX_CONCURRENT || queue.length === 0) return;

  const job = queue.shift();
  activeJobs++;

  logger.info(`Ishlanmoqda: ${job.id} | faol=${activeJobs}`);

  try {
    await processImageJob(job.data, (progress) => {
      logger.debug(`${job.id} progress: ${progress}%`);
    });
  } catch (err) {
    logger.error(`Job xatosi ${job.id}:`, err.message);
  } finally {
    activeJobs--;
    processNext(); // keyingisini boshlash
  }
}

module.exports = { addToQueue };
