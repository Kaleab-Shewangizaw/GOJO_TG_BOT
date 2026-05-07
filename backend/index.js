const path = require("node:path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const { logStartupHints } = require("./support/startup-hints");
const { initRedis, closeRedis } = require("./support/redis-client");
logStartupHints();

const bot = require("./bot");

(async () => {
  try {
    // Initialize Redis before starting bot
    const redisUrl = process.env.REDIS_URL;
    await initRedis(redisUrl);

    await bot.launch();
    console.log("[startup] Long polling active. Press Ctrl+C to stop.");
  } catch (err) {
    const msg = err?.message || String(err);
    console.error("[startup] launch failed:", msg);
    if (/409|Conflict|terminated by other getUpdates/i.test(msg)) {
      console.error(
        "[startup] Another bot instance may be polling. Stop other processes or use webhooks."
      );
    }
    process.exit(1);
  }
})();

/**
 * @param {string} signal
 */
async function shutdown(signal) {
  console.log(`[shutdown] ${signal}`);
  try {
    await bot.stop(signal);
  } catch {
    /* ignore */
  } finally {
    await closeRedis();
    process.exit(0);
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
