import { Scenes } from 'telegraf'
import { MyContext } from '../../bot'
import { ProviderFactory } from '../../providers/ProviderFactory'
import { getChooseKeyboard } from '../../util/keyboards'

const { BaseScene, Stage } = Scenes
const { leave } = Stage

const setProvider = new BaseScene<MyContext>('setprovider')

setProvider.enter(async (ctx: MyContext) => {
    const providerFactory = new ProviderFactory()
    const providers: string[] = providerFactory.getAvailableProvidersNames()
    return await ctx.reply(
        'Choose a provider:',
        getChooseKeyboard(ctx, providers)
    )
})

setProvider.action(/^callbackName__/, async (ctx) => {
    const { callbackQuery } = ctx

    if (!('data' in callbackQuery)) {
        return await ctx.reply(`Wrong callback query`)
    }

    const providerName = callbackQuery.data.split('__')[1]
    const providerFactory = new ProviderFactory()

    try {
        const provider = providerFactory.getProviderByName(providerName)
        ctx.session.options.provider = provider
    } catch (error) {
        return await ctx.reply(`Wrong provider: ${error}`)
    }

    ctx.session.messages = []
    ctx.answerCbQuery()
    await ctx.reply(
        `Provider ${providerName} selected. Context reset performed.`
    )
    return leave()
})

export default setProvider
