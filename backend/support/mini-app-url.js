/**
 * Telegram Web App buttons require an **https** URL (not http / not plain localhost).
 * @param {string | undefined} raw
 * @returns {boolean}
 */
function isHttpsWebAppUrl(raw) {
  const s = typeof raw === "string" ? raw.trim() : "";

  if (!s) {
    return false;
  }

  try {
    const u = new URL(s);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * @param {string | undefined} raw
 * @returns {{ ok: true; url: string } | { ok: false; reason: string }}
 */
function resolveMiniAppUrl(raw) {
  const s = typeof raw === "string" ? raw.trim() : "";

  if (!s) {
    return { ok: false, reason: "MINI_APP_URL is not set." };
  }

  try {
    const u = new URL(s);

    if (u.protocol === "http:") {
      const host = u.hostname.toLowerCase();

      if (host === "localhost" || host === "127.0.0.1") {
        return {
          ok: false,
          reason:
            "MINI_APP_URL uses http://localhost — Telegram Mini Apps need a public **https** URL (e.g. ngrok, Cloudflare Tunnel, or your deployed site).",
        };
      }

      return {
        ok: false,
        reason: "MINI_APP_URL must use **https://** for the Web App button.",
      };
    }

    if (u.protocol !== "https:") {
      return { ok: false, reason: "MINI_APP_URL must be an https:// URL." };
    }

    return { ok: true, url: s };
  } catch {
    return { ok: false, reason: "MINI_APP_URL is not a valid URL." };
  }
}

module.exports = {
  isHttpsWebAppUrl,
  resolveMiniAppUrl,
};
