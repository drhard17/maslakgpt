require('dotenv').config()
import { Telegraf, Markup, session, Scenes, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { G4F } from 'g4f'
import logger from './botlogger'
import _ from 'lodash'
import { models } from './models.json'
const { BaseScene, Stage } = Scenes

interface MySession extends Scenes.SceneSession {
    messages: {
        role: string,
        content: string
    }[],
    options: {
        provider: any,
        model: string,
        markdown: boolean
    }
}

interface MyContext extends Context {
	session: MySession
    scene: Scenes.SceneContextScene<MyContext>
}

const BOT_TOKEN = process.env.BOT_TOKEN
if (BOT_TOKEN === undefined) {
    throw new Error('BOT_TOKEN is not provided')
}
const bot = new Telegraf<MyContext>(BOT_TOKEN)

const roleScene = new BaseScene<MyContext>('SET_ROLE')
const stage = new Stage([roleScene])

bot.use(session())
bot.use((ctx, next) => {
    ctx.session ??= {
        messages: [],
        options: {
            provider: null,
            model: '',
            markdown: false
        }
    }
    return next()
})
bot.use(stage.middleware())

bot.telegram.setMyCommands([
    { command: 'model', description: 'Choose model' },
    { command: 'role', description: 'Choose bot role' },
    { command: 'reset', description: 'Reset conversation context' },
    { command: 'context', description: 'Show conversation context' }
])

roleScene.enter((ctx) => ctx.reply('Choose a role'))
roleScene.hears(/.+/, async (ctx) => {
    ctx.session.messages = [ { role: 'system', content: ctx.text } ]
    await ctx.reply('New role applied')
    return ctx.scene.leave()
})

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

bot.command('role', (ctx) => {
    ctx.scene.enter('SET_ROLE')
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
    const g4f = new G4F()
    const { messages, options } = ctx.session

    messages.push( { role: 'user', content: ctx.message.text } )
    await ctx.sendChatAction('typing')

    let answer
    try {
        answer = await g4f.chatCompletion(messages, options)    
    } catch (error) {
        answer = `Сервис GPT недоступен\n${error}`
    }
    
    messages.push( { role: 'assistant', content: answer } )
    await ctx.reply(answer, { parse_mode: 'Markdown' })
    logger(ctx, answer)
})

bot.action(/^model_/, async (ctx) => {
    
    const { callbackQuery } = ctx

    if(!('data' in callbackQuery)) {
        return await ctx.reply(`Wrong model`)    
    }

    const model = callbackQuery.data.split('__')[1]    
    ctx.session.options.model = model
    ctx.session.messages = []
    ctx.answerCbQuery()
    return await ctx.reply(`Model ${model} selected. Context reset performed`)

})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
