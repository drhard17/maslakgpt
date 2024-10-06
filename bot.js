const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const { G4F } = require("g4f");

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.on(message('text'), async (ctx) => {

    const g4f = new G4F()
    const messages = [
        { role: "user", content: ctx.message.text}
    ]
    const answer = await g4f.chatCompletion(messages)
    ctx.reply(answer)
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))