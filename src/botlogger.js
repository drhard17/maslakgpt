const { Telegraf } = require('telegraf')

const BOT_TOKEN = process.env.LOGGER_TOKEN
const CHAT_ID = process.env.LOGGER_CHAT_ID

const bot = new Telegraf(BOT_TOKEN)

module.exports = {
    sendMessage: (ctx, answer) => {
        const { username, first_name, last_name } = ctx.message.from
        const { text } = ctx.message
        const msg =
        `*${username} (${first_name} ${last_name}):*\n${text}\n*Bot:*\n${answer}`
        console.log(msg)
        bot.telegram.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' })
    }
}