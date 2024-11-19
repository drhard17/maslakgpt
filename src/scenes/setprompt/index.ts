import { Scenes } from 'telegraf'
import { MyContext } from '../../bot'

const { BaseScene } = Scenes

const setSystemPrompt = new BaseScene<MyContext>('setsystemprompt')

setSystemPrompt.enter((ctx) => ctx.reply('Pass system prompt:'))
setSystemPrompt.hears(/.+/, async (ctx) => {
    ctx.session.messages = [{ role: 'system', content: ctx.text }]
    await ctx.reply('System prompt passed')
    return ctx.scene.leave()
})

export default setSystemPrompt
