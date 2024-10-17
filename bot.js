const { Telegraf, Markup } = require('telegraf')
const { message } = require('telegraf/filters')
const { G4F } = require('g4f')
const logger = require('./botlogger.js')
const { models } = require('./models.json')
const _ = require('lodash')

const bot = new Telegraf(process.env.BOT_TOKEN)
const chats = []
let AIactive = true

bot.telegram.setMyCommands([
    { command: 'model', description: 'Choose model' },
    { command: 'role', description: 'Choose bot role' },
    { command: 'reset', description: 'Reset conversation context' }
])

bot.command('reset', (ctx) => {
    const chat = getChatById(ctx.chat.id)
    chat.messages = []
    ctx.reply('Context cleared')
})

bot.command('role', (ctx) => {
    const chat = getChatById(ctx.chat.id)
    ctx.reply('Choose a role (type):')
    AIactive = false
})

bot.on(message('text'), (ctx, next) => {
    if (AIactive) {
        return next()
    }
    const chat = getChatById(ctx.chat.id)
    ctx.reply('New role applied')
    chat.messages = [ { role: 'system', content: ctx.message } ]
    AIactive = true
})

bot.command('provider', (ctx) => {
    const chat = getChatById(ctx.chat.id)
    chat.options.provider = g4f.providers.GPT
})

bot.command('model', (ctx) => {
    const chat = getChatById(ctx.chat.id)
    chat.options.model = 'gpt-3.5-turbo'
    console.log(chat.options.model)
    return ctx.reply('Choose a model:', {
        ...Markup.inlineKeyboard(
            _.chunk(
                models.map((model) => Markup.button.callback(model, `model__${model}`))
            , 2)
        )
    })
})

bot.on(message('text'), async (ctx) => {
    if (!AIactive) {
        return
    }
    const g4f = new G4F()
    const chat = getChatById(ctx.chat.id)
    const { messages, options } = chat
    
    messages.push( { role: 'user', content: ctx.message.text } )
    ctx.sendChatAction('typing')
    const answer = await g4f.chatCompletion(messages, options)
    messages.push( { role: 'assistant', content: answer } )

    ctx.reply(answer, { parse_mode: 'Markdown' })
    logger.sendMessage(ctx, answer)
})

bot.action(/^model_/, (ctx) => {
    const model = ctx.callbackQuery.data.split('__')[1]
    const chat = getChatById(ctx.chat.id)
    chat.options.model = model
    chat.messages = []
    return ctx.reply(`Model ${model} selected. Context reset performed`)
})

const getChatById = (id) => {
    let chat = chats.find(chat => chat.id === id)
    if (!chat) {
        chats.push(
            createNewChat(id)
        )
        chat = getChatById(id)
    }
    return chat
}

const createNewChat = (id) => {
    return {
        id,
        messages: [],
        options: {
            provider: null,
            model: '',
            markdow: true
        }
    }
}

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
