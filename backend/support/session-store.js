const { getRedisClient, isConnected } = require('./redis-client');

/**
 * Sessions stored in Redis with 1-hour TTL
 * @typedef {{ type: 'ticket'; step: number; draft: Record<string, string> } | { type: 'verify'; step: number; draft: Record<string, string> }} UserSession
 */

const SESSION_TTL = 3600; // 1 hour in seconds

/**
 * Get a user session from Redis
 * @param {number} userId
 * @returns {Promise<UserSession | undefined>}
 */
async function getSession(userId) {
  try {
    if (!isConnected()) {
      console.warn('[Session] Redis not connected, cannot retrieve session');
      return undefined;
    }

    const client = getRedisClient();
    const key = `session:${userId}`;
    const data = await client.get(key);

    if (!data) {
      return undefined;
    }

    return JSON.parse(data);
  } catch (err) {
    console.error('[Session] Error retrieving session:', err.message);
    return undefined;
  }
}

/**
 * Set a user session in Redis
 * @param {number} userId
 * @param {UserSession} session
 * @returns {Promise<void>}
 */
async function setSession(userId, session) {
  try {
    if (!isConnected()) {
      console.warn('[Session] Redis not connected, session not persisted');
      return;
    }

    const client = getRedisClient();
    const key = `session:${userId}`;
    await client.setEx(key, SESSION_TTL, JSON.stringify(session));
  } catch (err) {
    console.error('[Session] Error storing session:', err.message);
  }
}

/**
 * Clear a user session from Redis
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function clearSession(userId) {
  try {
    if (!isConnected()) {
      console.warn('[Session] Redis not connected, session not cleared');
      return;
    }

    const client = getRedisClient();
    const key = `session:${userId}`;
    await client.del(key);
  } catch (err) {
    console.error('[Session] Error clearing session:', err.message);
  }
}

module.exports = {
  getSession,
  setSession,
  clearSession,
};
