/**
 * @param {string} text
 * @param {number} [maxLen]
 * @returns {string[]}
 */
function splitTelegramMessage(text, maxLen = 4000) {
  if (text.length <= maxLen) {
    return [text];
  }

  const parts = [];
  let rest = text;

  while (rest.length > 0) {
    if (rest.length <= maxLen) {
      parts.push(rest);
      break;
    }

    let chunk = rest.slice(0, maxLen);
    const breakAt = Math.max(
      chunk.lastIndexOf("\n\n"),
      chunk.lastIndexOf("\n"),
      chunk.lastIndexOf(" ")
    );

    if (breakAt > Math.floor(maxLen * 0.5)) {
      chunk = chunk.slice(0, breakAt);
    }

    parts.push(chunk.trimEnd());
    rest = rest.slice(chunk.length).trimStart();
  }

  return parts;
}

module.exports = { splitTelegramMessage };
