const path = require("node:path");

const { resolveMiniAppUrl } = require("./mini-app-url");

/**
 * Logs a non-secret readiness checklist (console only).
 */
function logStartupHints() {
  const botToken = process.env.BOT_TOKEN?.trim();
  const groq = process.env.GROQ_API_KEY?.trim();
  const mini = process.env.MINI_APP_URL?.trim();

  const tokenOk = Boolean(
    botToken && botToken.includes(":") && botToken.length > 15
  );

  console.log(
    `[startup] BOT_TOKEN: ${tokenOk ? "set" : "missing or too short — check backend/.env"}`
  );
  console.log(
    `[startup] GROQ_API_KEY: ${groq ? "set (AI replies enabled)" : "missing (use /menu, /support)"}`
  );

  const resolved = resolveMiniAppUrl(mini);

  if (resolved.ok) {
    const u = resolved.url;
    const preview = u.length > 64 ? `${u.slice(0, 64)}…` : u;
    console.log(`[startup] MINI_APP_URL: ok (${preview})`);
  } else {
    console.log(`[startup] MINI_APP_URL: ${resolved.reason}`);
    console.log(
      "[startup] Tip: expose Next.js with an https tunnel, then set MINI_APP_URL to that URL."
    );
  }

  console.log(
    `[startup] Expected .env: ${path.join(__dirname, "..", ".env")} (cwd: ${process.cwd()})`
  );
}

module.exports = { logStartupHints };
