const { clearSession, getSession, setSession } = require("./session-store");
const { buildUrls } = require("./urls");

/**
 * @typedef {import('telegraf').Context} Ctx
 */

/**
 * @param {Ctx} ctx
 */
async function startTicketFlow(ctx) {
  const userId = ctx.from?.id;

  if (!userId) {
    return;
  }

  setSession(userId, {
    type: "ticket",
    step: 1,
    draft: {},
  });

  await ctx.reply(
    "**Support ticket draft**\n\n" +
      "Step 1 of 4 — **Account email on file** with GojoHost (the one you used to sign up):\n\n" +
      "_Send /cancel anytime to exit._",
    { parse_mode: "Markdown" }
  );
}

/**
 * @param {Ctx} ctx
 */
async function startVerifyFlow(ctx) {
  const userId = ctx.from?.id;

  if (!userId) {
    return;
  }

  setSession(userId, {
    type: "verify",
    step: 1,
    draft: {},
  });

  await ctx.reply(
    "**Account verification (for sensitive changes)**\n\n" +
      "Step 1 of 3 — **Domain name** tied to the hosting (example: `mysite.com`, no `www` needed):\n\n" +
      "_Send /cancel anytime to exit._",
    { parse_mode: "Markdown" }
  );
}

/**
 * @param {Ctx} ctx
 * @returns {Promise<boolean>}
 */
async function handleSessionText(ctx) {
  const userId = ctx.from?.id;
  const text = ctx.message?.text?.trim();

  if (!userId || !text || text.startsWith("/")) {
    return false;
  }

  const session = getSession(userId);

  if (!session) {
    return false;
  }

  if (session.type === "ticket") {
    await handleTicketStep(ctx, session, text);
    return true;
  }

  if (session.type === "verify") {
    await handleVerifyStep(ctx, session, text);
    return true;
  }

  return false;
}

/**
 * @param {Ctx} ctx
 * @param {import('./session-store').UserSession} session
 * @param {string} text
 */
async function handleTicketStep(ctx, session, text) {
  const userId = /** @type {number} */ (ctx.from?.id);
  const urls = buildUrls();

  if (session.step === 1) {
    session.draft.email = text;
    session.step = 2;
    setSession(userId, session);
    await ctx.reply(
      "**Step 2** — **Short category** (e.g. billing, email, website down, dns):",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (session.step === 2) {
    session.draft.category = text;
    session.step = 3;
    setSession(userId, session);
    await ctx.reply(
      "**Step 3** — **What you already tried** (one message, keep it honest):",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (session.step === 3) {
    session.draft.triage = text;
    session.step = 4;
    setSession(userId, session);
    await ctx.reply(
      "**Step 4** — **Problem description** — include **exact error text** or screenshots description:",
      { parse_mode: "Markdown" }
    );
    return;
  }

  session.draft.details = text;

  const body =
    `**New support ticket (draft)**\n\n` +
    `**Email on file:** ${session.draft.email}\n` +
    `**Domain / service:** _(add if missing below)_\n` +
    `**Category:** ${session.draft.category}\n` +
    `**Already tried:** ${session.draft.triage}\n\n` +
    `**Details:**\n${session.draft.details}\n\n` +
    `Telegram user: @${ctx.from?.username || "(no username)"} (id ${ctx.from?.id})\n\n` +
    `Send this block to **${urls.SUPPORT_EMAIL}** or Telegram **${urls.SUPPORT_TELEGRAM}**.`;

  clearSession(userId);

  await ctx.reply(body, { parse_mode: "Markdown" });

  await ctx.reply("**Done.** If you need the menu again: /menu", {
    parse_mode: "Markdown",
  });
}

/**
 * @param {Ctx} ctx
 * @param {import('./session-store').UserSession} session
 * @param {string} text
 */
async function handleVerifyStep(ctx, session, text) {
  const userId = /** @type {number} */ (ctx.from?.id);
  const urls = buildUrls();

  if (session.step === 1) {
    session.draft.domain = text;
    session.step = 2;
    setSession(userId, session);
    await ctx.reply(
      "**Step 2** — **Last invoice ID or last 4 digits of phone** on the account (whatever you can share safely here):",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (session.step === 2) {
    session.draft.invoiceOrPhone = text;
    session.step = 3;
    setSession(userId, session);
    await ctx.reply(
      "**Step 3** — **What needs changing?** (password reset, DNS change, billing, etc.)",
      { parse_mode: "Markdown" }
    );
    return;
  }

  session.draft.request = text;

  const summary =
    `**Verification request (send to support)**\n\n` +
    `**Domain:** ${session.draft.domain}\n` +
    `**Reference:** ${session.draft.invoiceOrPhone}\n` +
    `**Request:** ${session.draft.request}\n\n` +
    `Telegram: @${ctx.from?.username || "(no username)"} / id ${ctx.from?.id}\n\n` +
    `Email **${urls.SUPPORT_EMAIL}** or **${urls.SUPPORT_TELEGRAM}**.\n` +
    `Support may ask for DNS TXT or official ID per policy.`;

  clearSession(userId);

  await ctx.reply(summary, { parse_mode: "Markdown" });
}

/**
 * @param {Ctx} ctx
 */
async function cancelFlow(ctx) {
  const userId = ctx.from?.id;

  if (userId) {
    clearSession(userId);
  }

  await ctx.reply("Cancelled. /menu when you need the hub.");
}

module.exports = {
  startTicketFlow,
  startVerifyFlow,
  handleSessionText,
  cancelFlow,
};
