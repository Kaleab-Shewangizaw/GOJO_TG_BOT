/**
 * @param {Record<string, string | undefined>} urls
 * @returns {(text: string) => string}
 */
function createTemplateReplacer(urls) {
  return function apply(text) {
    let out = text;
    Object.entries(urls).forEach(([key, val]) => {
      if (!val) {
        return;
      }
      const re = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      out = out.replace(re, val);
    });

    Object.entries(urls).forEach(([key, val]) => {
      if (!val) {
        return;
      }
      const reFallback = new RegExp(`PLACEHOLDER_${key}`, "g");
      out = out.replace(reFallback, val);
    });

    out = out.replace(/\{\{\s*BASE_URL\s*\}\}/g, urls.BASE_URL || "https://gojohost.net");
    out = out.replace(/\{\{\s*SUPPORT_EMAIL\s*\}\}/g, urls.SUPPORT_EMAIL || "support@gojohost.net");
    out = out.replace(/\{\{\s*SUPPORT_PHONE\s*\}\}/g, urls.SUPPORT_PHONE || "+251940248788");
    out = out.replace(/\{\{\s*SUPPORT_TELEGRAM\s*\}\}/g, urls.SUPPORT_TELEGRAM || "@GojoHostSupport");

    return out;
  };
}

module.exports = { createTemplateReplacer };
