const express = require('express');
const logger = require('../utils/logger');

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Queue stats
app.get('/stats', async (req, res) => {
  try {
    const { getQueue } = require('../queue/imageQueue');
    const queue = getQueue();

    if (!queue) {
      return res.json({ queue: 'in-memory', stats: null });
    }

    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    res.json({ queue: 'bull', stats: { waiting, active, completed, failed } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function startApiServer() {
  const port = parseInt(process.env.API_PORT) || 3000;
  app.listen(port, () => {
    logger.info(`API server running on port ${port}`);
  });
}

module.exports = { startApiServer, app };
