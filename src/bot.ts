require('dotenv').config()
import { Telegraf, session, Scenes, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { ProviderFactory } from './providers/ProviderFactory'
import { Provider, Roles } from './providers/Provider'
import setModel from './scenes/setmodel'
import setProvider from './scenes/setprovider'
import setSystemPrompt from './scenes/setprompt'
import logger from './util/botlogger'

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

const stage = new Scenes.Stage<MyContext>([
    setSystemPrompt, 
    setModel, 
    setProvider
])

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
    { command: 'provider', description: 'Choose a provider' },
    { command: 'model', description: 'Choose a model' },
    { command: 'prompt', description: 'Pass system prompt' },
    { command: 'reset', description: 'Reset conversation context' },
    { command: 'context', description: 'Show conversation context' }
])

bot.command('context', async (ctx) => {
    if (!ctx.session.messages.length) {
        return await ctx.reply('The context is empty')
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

bot.command('prompt', (ctx) => {
    ctx.scene.enter('setsystemprompt')
})

bot.command('model', (ctx) => {
    ctx.scene.enter('setmodel')
})

bot.command('provider', (ctx) => {
    ctx.scene.enter('setprovider')
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
        answer = `Service unavailable\n${error}`
    }
    
    messages.push( { role: 'assistant', content: answer } )
    await ctx.reply(answer, { parse_mode: 'Markdown' })
    logger(ctx, answer)
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

