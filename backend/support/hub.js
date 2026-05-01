const { Markup } = require("telegraf");

const { startTicketFlow, startVerifyFlow: beginVerifyFlow } = require("./flows");

const { categories } = require("./categories");
const { guides } = require("./guides");
const { createTemplateReplacer } = require("./apply-template");
const { splitTelegramMessage } = require("./split-message");
const { buildUrls } = require("./urls");

const CB_MAIN = "m:0";

/**
 * @param {string} label
 * @param {number} [maxLen]
 */
function truncateButtonLabel(label, maxLen = 58) {
  const s = String(label).trim();
  if (s.length <= maxLen) {
    return s;
  }
  return `${s.slice(0, maxLen - 1)}…`;
}

/** @returns {import('telegraf').InlineKeyboardMarkup} */
function rootKeyboard() {
  const rows = [];

  for (let i = 0; i < categories.length; i += 2) {
    /** @type {import('telegraf').InlineKeyboardButton[]} */
    const row = [];

    row.push({
      text: truncateButtonLabel(categories[i].title),
      callback_data: `m:${i + 1}`,
    });

    if (categories[i + 1]) {
      row.push({
        text: truncateButtonLabel(categories[i + 1].title),
        callback_data: `m:${i + 2}`,
      });
    }

    rows.push(row);
  }

  return Markup.inlineKeyboard(rows).reply_markup;
}

/**
 * @param {number} catIndexOneBased
 */
function categoryKeyboard(catIndexOneBased) {
  const cat = categories[catIndexOneBased - 1];

  if (!cat?.children?.length) {
    return Markup.inlineKeyboard([
      [{ text: "⬅ Main menu", callback_data: CB_MAIN }],
    ]).reply_markup;
  }

  /** @type {import('telegraf').InlineKeyboardButton[][]} */
  const rows = [];

  for (let i = 0; i < cat.children.length; i += 2) {
    /** @type {import('telegraf').InlineKeyboardButton[]} */
    const row = [];

    row.push({
      text: truncateButtonLabel(cat.children[i].title),
      callback_data: `m:${catIndexOneBased}:${i}`,
    });

    if (cat.children[i + 1]) {
      row.push({
        text: truncateButtonLabel(cat.children[i + 1].title),
        callback_data: `m:${catIndexOneBased}:${i + 1}`,
      });
    }

    rows.push(row);
  }

  rows.push([{ text: "⬅ Main menu", callback_data: CB_MAIN }]);

  return Markup.inlineKeyboard(rows).reply_markup;
}

/**
 * @param {import('telegraf').Context} ctx
 */
async function sendMainMenu(ctx) {
  const text =
    "**GojoHost — Hosting Support**\n\n" +
    "Pick a topic. You can also type a question anytime for AI help, use **/dns** *domain*, **/ticket** for a wizard, **/verify** for ownership checklist, **/plans**, **/support**.";

  if (ctx.callbackQuery?.message) {
    await ctx.editMessageText(text, {
      parse_mode: "Markdown",
      reply_markup: rootKeyboard(),
    });
    return;
  }

  await ctx.reply(text, {
    parse_mode: "Markdown",
    reply_markup: rootKeyboard(),
  });
}

/**
 * @param {import('telegraf').Context} ctx
 * @param {string} guideKey
 */
async function sendGuide(ctx, guideKey) {
  const tpl = guides[guideKey];

  if (!tpl) {
    await ctx.reply(
      "This guide is unavailable. Email " + buildUrls().SUPPORT_EMAIL + "."
    );
    return;
  }

  const apply = createTemplateReplacer(buildUrls());
  const resolved = apply(tpl);
  const parts = splitTelegramMessage(resolved);

  /** @type {import('telegraf').InlineKeyboardMarkup | undefined} */
  let markup = undefined;

  if (ctx.callbackQuery?.data) {
    const matchLeaf = /^m:(\d+):(\d+)$/.exec(ctx.callbackQuery.data);
    if (matchLeaf) {
      const catIdx = Number(matchLeaf[1]);
      markup = categoryKeyboard(catIdx);
    }
  }

  if (ctx.callbackQuery?.message) {
    await ctx.editMessageText(parts[0], {
      parse_mode: "Markdown",
      reply_markup: markup,
    });

    for (let i = 1; i < parts.length; i += 1) {
      await ctx.reply(parts[i], { parse_mode: "Markdown" });
    }

    return;
  }

  for (const part of parts) {
    await ctx.reply(part, { parse_mode: "Markdown" });
  }
}

/**
 * @param {import('telegraf').Context} ctx
 */
async function startTicketWizard(ctx) {
  await startTicketFlow(ctx);
}

/**
 * @param {import('telegraf').Context} ctx
 */
async function startVerifyFlow(ctx) {
  await beginVerifyFlow(ctx);
}

/**
 * @param {import('telegraf').Telegraf} bot
 */
function registerSupportHub(bot) {
  bot.command("menu", async (ctx) => {
    await sendMainMenu(ctx);
  });

  bot.action(/^m:0$/, async (ctx) => {
    await ctx.answerCbQuery();
    await sendMainMenu(ctx);
  });

  bot.action(/^m:(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const idx = Number(ctx.match[1]);

    if (idx < 1 || idx > categories.length) {
      await ctx.reply("Unknown menu.");
      return;
    }

    const cat = categories[idx - 1];
    const title = `**${cat.title}**\n\nChoose an option:`;

    await ctx.editMessageText(title, {
      parse_mode: "Markdown",
      reply_markup: categoryKeyboard(idx),
    });
  });

  bot.action(/^m:(\d+):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const catIdx = Number(ctx.match[1]);
    const itemIdx = Number(ctx.match[2]);

    if (catIdx < 1 || catIdx > categories.length) {
      await ctx.reply("Unknown category.");
      return;
    }

    const item = categories[catIdx - 1].children[itemIdx];

    if (!item) {
      await ctx.reply("Unknown option.");
      return;
    }

    if (item.guideKey === "__ticket_start") {
      await startTicketWizard(ctx);
      return;
    }

    await sendGuide(ctx, item.guideKey);
  });
}

module.exports = {
  registerSupportHub,
  sendMainMenu,
  sendGuide,
  startTicketWizard,
  startVerifyFlow,
  rootKeyboard,
  categoryKeyboard,
  CB_MAIN,
  buildUrls,
};
