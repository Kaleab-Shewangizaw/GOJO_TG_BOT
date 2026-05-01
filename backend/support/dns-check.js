const dns = require("node:dns").promises;

/** @typedef {{ type: string; records: string[]; error?: string }} DnsResolveResult */

/**
 * @param {string} rawDomain
 * @param {'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME'} [recordType]
 * @returns {Promise<DnsResolveResult>}
 */
async function resolveRecords(rawDomain, recordType = "A") {
  const fqdn = normalizeDomain(rawDomain);
  const type = String(recordType).toUpperCase();

  if (!fqdn || fqdn.includes("/")) {
    return { type, records: [], error: "Invalid domain format." };
  }

  try {
    if (type === "MX") {
      const mx = /** @type {import('node:dns').MxRecord[]} */ (
        await dns.resolveMx(fqdn)
      );
      const ranked = [...mx].sort((a, b) => a.priority - b.priority);
      const records = ranked.map((e) => `${e.priority} ${e.exchange}`);
      return { type, records };
    }

    if (type === "TXT") {
      const chunks = /** @type {string[][]} */ (await dns.resolveTxt(fqdn));
      const records = chunks.map((parts) => parts.join(""));
      return { type, records };
    }

    if (type === "NS") {
      const records = await dns.resolveNs(fqdn);
      return { type, records };
    }

    if (type === "CNAME") {
      const records = await dns.resolveCname(fqdn);
      return { type, records };
    }

    if (type === "AAAA") {
      const records = await dns.resolve6(fqdn);
      return { type, records };
    }

    const records = await dns.resolve4(fqdn);
    return { type, records };
  } catch (err) {
    const code = /** @type {NodeJS.ErrnoException} */ (err).code;
    return {
      type,
      records: [],
      error: code ? `${code}` : /** @type {Error} */ (err).message,
    };
  }
}

/**
 * @param {string} raw
 * @returns {string}
 */
function normalizeDomain(raw) {
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/\/.*$/, "");
  return s.endsWith(".") ? s.slice(0, -1) : s;
}

/**
 * @param {DnsResolveResult} result
 * @returns {string}
 */
function formatDnsReply(domain, result) {
  const lines = [
    `DNS check for **${domain}** (type ${result.type}, resolver from this bot’s server):`,
  ];

  if (result.error) {
    lines.push(`Result: lookup failed (${result.error}).`);
    return lines.join("\n");
  }

  if (result.records.length === 0) {
    lines.push(`Result: no ${result.type} records returned.`);
    return lines.join("\n");
  }

  const shown = result.records.slice(0, 25).map((line) => `• \`${line}\``).join("\n");
  lines.push(shown);

  if (result.records.length > 25) {
    lines.push("• _(truncated — more than 25 values)_");
  }

  lines.push("_Propagation differs worldwide; retry later if you expect changes._");

  return lines.join("\n");
}

module.exports = {
  resolveRecords,
  formatDnsReply,
  normalizeDomain,
};
