import { ProviderFactory } from './providers/ProviderFactory'
import { MyContext } from './SessionContext'
import logger from './util/botlogger'

const createCompletion = async (ctx: MyContext) => {
    // const { messages, options } = ctx.session
    // const { providerName } = options
    // const factory = new ProviderFactory()
    // const provider = factory.getProviderByName(providerName)
    // messages.push({ role: 'user', content: ctx.message.text })
    // await ctx.sendChatAction('typing')
    // let answer
    // try {
    //     answer = await provider.createCompletion(messages, options)
    // } catch (error) {
    //     answer = `Service unavailable\n${error}`
    // }
    // messages.push({ role: 'assistant', content: answer })
    // await ctx.reply(answer, { parse_mode: 'Markdown' })
    // logger(ctx, answer)
}
