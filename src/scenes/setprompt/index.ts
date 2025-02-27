import { Scenes } from 'telegraf'
import { MyContext } from '../../SessionContext'

const { BaseScene } = Scenes

const setSystemPrompt = new BaseScene<MyContext>('setsystemprompt')

setSystemPrompt.enter((ctx) => ctx.reply('Pass system prompt:'))
setSystemPrompt.hears(/.+/, async (ctx) => {
    let messages = ctx.session.conversations.at(-1)?.messages

    if (!messages) {
        throw new Error('Wrong session')
    }

    messages.push({ role: 'system', content: ctx.text })
    await ctx.reply('System prompt passed')
    return ctx.scene.leave()
})

export default setSystemPrompt
