require('dotenv').config()
import { Telegraf, Markup, session, Scenes, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import logger from './botlogger'
import Provider, { Roles } from './providers/Provider'
import ProviderFactory from './providers/ProviderFactory'
import _ from 'lodash'
import setModel from './scenes/setmodel'
const { BaseScene, Stage } = Scenes

export interface MySession extends Scenes.SceneSession {
    messages: {
        role: Roles,
        content: string
    }[],
    options: {
        provider: Provider,
        model: string,
        markdown: boolean
    }
}

export interface MyContext extends Context {
	session: MySession
    scene: Scenes.SceneContextScene<MyContext>
}

const BOT_TOKEN = process.env.BOT_TOKEN
if (BOT_TOKEN === undefined) {
    throw new Error('BOT_TOKEN is not provided')
}
const bot = new Telegraf<MyContext>(BOT_TOKEN)

const roleScene = new BaseScene<MyContext>('SET_ROLE')

const stage = new Stage([roleScene, setModel])

bot.use(session())
bot.use((ctx, next) => {
    ctx.session ??= {
        messages: [],
        options: {
            provider: ProviderFactory.getDefaultProvider(),
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

bot.command('model', (ctx) => {
    console.log('Here model scene')
    ctx.scene.enter('setmodel')
})

bot.on(message('text'), async (ctx) => {
    
    const { messages, options } = ctx.session
    const GPTprovider = options.provider

    messages.push( { role: 'user', content: ctx.message.text } )
    await ctx.sendChatAction('typing')

    let answer
    try {
        answer = await GPTprovider.createCompletion(messages)    
    } catch (error) {
        answer = `Сервис GPT недоступен\n${error}`
    }
    
    messages.push( { role: 'assistant', content: answer } )
    await ctx.reply(answer, { parse_mode: 'Markdown' })
    logger(ctx, answer)
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

