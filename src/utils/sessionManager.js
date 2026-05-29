const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// In-memory session store (replace with Redis for multi-instance)
const sessions = new Map();

const SESSION_TIMEOUT = (parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30) * 60 * 1000;

function initSession(userId) {
  const session = {
    id: uuidv4(),
    userId,
    state: 'uploading', // uploading | waiting_background | processing | done
    images: [],
    backgroundPath: null,
    outputFiles: [],
    options: {
      whiteBackground: false,
      blurBackground: false,
      hdMode: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(userId.toString(), session);
  logger.debug(`Session initialized for user ${userId}`);
  return session;
}

function getSession(userId) {
  const session = sessions.get(userId.toString());
  if (!session) return null;

  // Check timeout
  if (Date.now() - session.updatedAt > SESSION_TIMEOUT) {
    sessions.delete(userId.toString());
    logger.debug(`Session expired for user ${userId}`);
    return null;
  }

  return session;
}

function updateSession(userId, data) {
  const existing = sessions.get(userId.toString());
  if (!existing) return null;

  const updated = { ...existing, ...data, updatedAt: Date.now() };
  sessions.set(userId.toString(), updated);
  return updated;
}

function resetSession(userId) {
  sessions.delete(userId.toString());
  logger.debug(`Session reset for user ${userId}`);
}

function getAllSessions() {
  return Array.from(sessions.values());
}

function cleanExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;
  for (const [userId, session] of sessions.entries()) {
    if (now - session.updatedAt > SESSION_TIMEOUT) {
      sessions.delete(userId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    logger.info(`Cleaned ${cleaned} expired sessions`);
  }
  return cleaned;
}

module.exports = {
  initSession,
  getSession,
  updateSession,
  resetSession,
  getAllSessions,
  cleanExpiredSessions,
};
