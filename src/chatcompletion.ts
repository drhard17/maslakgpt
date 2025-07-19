import { ProviderFactory } from './providers/ProviderFactory'
import tgLogger from './util/botlogger'
import logger from './util/logger'
import { MyContext } from './SessionContext'
import { Message, Update } from 'telegraf/types'
import { NarrowedContext } from 'telegraf'

export const createCompletion = async (
    ctx: NarrowedContext<
        MyContext,
        Update.MessageUpdate<Record<'text', {}> & Message.TextMessage>
    >
): Promise<void> => {
    const { conversations, options } = ctx.session
    const { providerName } = options

    const messages = conversations.at(-1)?.messages

    if (!messages) {
        throw new Error('Wrong session')
    }

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
    messages.push({ role: 'assistant', content: answer})
    await ctx.reply(answer, { parse_mode: 'Markdown' })

    logger.info(answer)
    tgLogger(ctx, answer)
}
