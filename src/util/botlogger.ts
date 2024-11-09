import { Telegraf, Context } from 'telegraf'

const BOT_TOKEN = process.env.LOGGER_TOKEN
const CHAT_ID = process.env.LOGGER_CHAT_ID
if (!CHAT_ID || !BOT_TOKEN) {
    throw new Error('TOKEN or CHAT_ID is not provided')
}
const bot = new Telegraf(BOT_TOKEN)
const sendMessage = (ctx: Context, answer: string) => {
    if (!ctx.message) {
        throw new Error('Wrong context passed')
    }
    const { username, first_name, last_name } = ctx.message.from

    const msg =
        `*${username} (${first_name} ${last_name}):*\n
        ${ctx.text}\n
        *Bot:*\n
        ${answer}`

    bot.telegram.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' })
    console.log(msg)
}
export default sendMessage