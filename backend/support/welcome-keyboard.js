const { resolveMiniAppUrl } = require("./mini-app-url");

/**
 * Custom reply keyboard shown on /start.
 * Telegram Web App row is only added when MINI_APP_URL is valid https.
 */
function buildWelcomeReplyMarkup() {
  const rows = [];

  const mini = resolveMiniAppUrl(process.env.MINI_APP_URL);

  if (mini.ok) {
    rows.push([{ text: "Open Mini App", web_app: { url: mini.url } }]);
  }

  rows.push([{ text: "/menu" }, { text: "/support" }]);
  rows.push([{ text: "/ticket" }, { text: "/verify" }]);

  return {
    reply_markup: {
      keyboard: rows,
      resize_keyboard: true,
      is_persistent: true,
    },
  };
}

module.exports = { buildWelcomeReplyMarkup };
