const redis = require('redis');

let client = null;

/**
 * Initialize Redis client
 * @param {string} [redisUrl] - Redis connection URL (default: redis://localhost:6379)
 * @returns {Promise<void>}
 */
async function initRedis(redisUrl) {
  if (client) {
    return;
  }

  const url = redisUrl || 'redis://localhost:6379';

  client = redis.createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[Redis] Max reconnection attempts reached');
          return new Error('Redis reconnect failed');
        }
        return Math.min(retries * 50, 500);
      },
    },
  });

  client.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  client.on('ready', () => {
    console.log('[Redis] Ready');
  });

  try {
    await client.connect();
    console.log('[Redis] Initialization complete');
  } catch (err) {
    console.error('[Redis] Connection failed:', err.message);
    client = null;
    throw err;
  }
}

/**
 * Get Redis client instance
 * @returns {redis.RedisClient | null}
 */
function getRedisClient() {
  return client;
}

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
function isConnected() {
  return client && client.isOpen;
}

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
async function closeRedis() {
  if (client) {
    try {
      await client.quit();
      console.log('[Redis] Connection closed');
    } catch (err) {
      console.error('[Redis] Error closing connection:', err.message);
    }
    client = null;
  }
}

module.exports = {
  initRedis,
  getRedisClient,
  isConnected,
  closeRedis,
};
