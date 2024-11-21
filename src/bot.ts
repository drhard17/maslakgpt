require('dotenv').config()
import { Telegraf, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import setModel from './scenes/setmodel'
import setProvider from './scenes/setprovider'
import setSystemPrompt from './scenes/setprompt'
import { MongoClient, ServerApiVersion } from 'mongodb'
import { session } from 'telegraf-session-mongodb'
import { initSession, MyContext } from './SessionContext'
import { createCompletion } from './chatcompletion'

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
        initSession(ctx)
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
        await createCompletion(ctx)
    })

    bot.launch()
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
})
