require('dotenv').config()
import { Telegraf, Scenes, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { ProviderFactory } from './providers/ProviderFactory'
import setModel from './scenes/setmodel'
import setProvider from './scenes/setprovider'
import setSystemPrompt from './scenes/setprompt'
import logger from './util/botlogger'
import { MongoClient, ServerApiVersion } from 'mongodb'
import { session } from 'telegraf-session-mongodb'
import { initSession, MyContext } from './SessionContext'

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

const { MONGODB_URI } = process.env
if (MONGODB_URI === undefined) {
    throw new Error('MONGODB_URI is not provided')
}

MongoClient.connect(MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
}).then((client) => {
    const db = client.db()
    bot.use(session(db, { sessionName: 'session', collectionName: 'sessions' }))
    bot.use((ctx, next) => {
        // ctx.session.messages ??= []
        // ctx.session.options ??= {
        //     providerName: 'OpenAI',
        //     model: 'gpt-4o',
        //     markdown: false
        // }
        ctx = initSession(ctx)
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
            ctx.session.messages
                .map((msg) => {
                    return `*${msg.role}*:\n${msg.content}\n`
                })
                .join('\n'),
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
        const { providerName } = options

        const factory = new ProviderFactory()
        const provider = factory.getProviderByName(providerName)

        messages.push({ role: 'user', content: ctx.message.text })
        await ctx.sendChatAction('typing')

        let answer
        try {
            answer = await provider.createCompletion(messages, options)
        } catch (error) {
            answer = `Service unavailable\n${error}`
        }

        messages.push({ role: 'assistant', content: answer })
        await ctx.reply(answer, { parse_mode: 'Markdown' })
        logger(ctx, answer)
    })

    bot.launch()
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
