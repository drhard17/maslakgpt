const { Telegraf, Markup, session, Scenes } = require('telegraf')
const { message } = require('telegraf/filters')
const { BaseScene, Stage } = Scenes
const { G4F } = require('g4f')
const logger = require('./botlogger.js')
const { models } = require('./models.json')
const _ = require('lodash')

const bot = new Telegraf(process.env.BOT_TOKEN)
let AIactive = true

bot.use(session())

bot.use((ctx, next) => {
    ctx.session ??= {
        testTapCount: 0,
        messages: [],
        options: {
            provider: null,
            model: '',
            markdow: true
        }
    }
    return next()
})

bot.telegram.setMyCommands([
    { command: 'model', description: 'Choose model' },
    { command: 'role', description: 'Choose bot role' },
    { command: 'reset', description: 'Reset conversation context' },
    { command: 'context', description: 'Show conversation context' }
])

bot.command('context', async (ctx) => {
    if (!ctx.session.messages.length) {
        return await ctx.reply('EMPTY')
    }
    await ctx.reply(
        ctx.session.messages.map((msg) => {
            return `*${msg.role}*:\n${msg.content}\n`
        }).join('\n'),
        { parse_mode: 'Markdown' }
    )
})

bot.command('reset', async (ctx) => {
    ctx.session.messages = []
    await ctx.reply('Context cleared')
})

bot.command('role', async (ctx) => {
    await ctx.reply('Choose a role (type):')
    AIactive = false
})

bot.on(message('text'), async (ctx, next) => {
    if (AIactive) {
        return next()
    }
    await ctx.reply('New role applied')
    ctx.session.messages = [ { role: 'system', content: ctx.message.text } ]
    AIactive = true
})

bot.command('model', async (ctx) => {
    return await ctx.reply('Choose a model:', {
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
    const { messages, options } = ctx.session
    
    messages.push( { role: 'user', content: ctx.message.text } )
    await ctx.sendChatAction('typing')
    const answer = await g4f.chatCompletion(messages, options)
    messages.push( { role: 'assistant', content: answer } )

    await ctx.reply(answer, { parse_mode: 'Markdown' })
    logger.sendMessage(ctx, answer)
})

bot.action(/^model_/, async (ctx) => {
    const model = ctx.callbackQuery.data.split('__')[1]
    ctx.session.options.model = model
    ctx.session.messages = []
    return await ctx.reply(`Model ${model} selected. Context reset performed`)
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
