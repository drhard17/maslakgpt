import { Provider } from './providers/Provider'
import logger from './util/botlogger'

export const createCompletion = async (ctx: any): Promise<void> => {
    const { messages } = ctx.session
    const provider: Provider = ctx.provider

    messages.push({ role: 'user', content: ctx.message.text })
    await ctx.sendChatAction('typing')
    let answer
    try {
        answer = await provider.createCompletion(messages)
    } catch (error) {
        answer = `Service error\n${error}`
    }
    messages.push({ role: 'assistant', content: answer })
    await ctx.reply(answer, { parse_mode: 'Markdown' })

    logger(ctx, answer)
}
