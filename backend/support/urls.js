/**
 * Resolved URL placeholders for guides and flows.
 * @returns {Record<string, string>}
 */
function buildUrls() {
  const base = (process.env.BASE_URL || "https://gojohost.net").replace(/\/$/, "");

  return {
    BASE_URL: base,
    CLIENT_AREA_URL:
      process.env.CLIENT_AREA_URL || `${base}/client-area`,
    CPANEL_URL_HINT:
      process.env.CPANEL_URL_HINT || `${base}/cpanel-login`,
    WEBMAIL_URL_HINT:
      process.env.WEBMAIL_URL_HINT ||
      "https://webmail.yourdomain.com (replace yourdomain.com)",
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@gojohost.net",
    SUPPORT_PHONE: process.env.SUPPORT_PHONE || "+251940248788",
    SUPPORT_TELEGRAM: process.env.SUPPORT_TELEGRAM || "@GojoHostSupport",
  };
}

module.exports = { buildUrls };
