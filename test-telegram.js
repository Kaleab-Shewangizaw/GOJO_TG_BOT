require('dotenv').config();
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.telegram.getMe().then(console.log).catch(err => {
  console.log("Full error:", err);
  if (err.cause) console.log("Cause:", err.cause);
});
