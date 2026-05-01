/**
 * In-memory sessions (ticket / verify flows). Use Redis in production if needed.
 * @typedef {{ type: 'ticket'; step: number; draft: Record<string, string> } | { type: 'verify'; step: number; draft: Record<string, string> }} UserSession
 */

/** @type {Map<number, UserSession>} */
const sessions = new Map();

/**
 * @param {number} userId
 * @returns {UserSession | undefined}
 */
function getSession(userId) {
  return sessions.get(userId);
}

/**
 * @param {number} userId
 * @param {UserSession} session
 */
function setSession(userId, session) {
  sessions.set(userId, session);
}

/**
 * @param {number} userId
 */
function clearSession(userId) {
  sessions.delete(userId);
}

module.exports = {
  getSession,
  setSession,
  clearSession,
};
