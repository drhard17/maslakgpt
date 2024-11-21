import { Scenes } from 'telegraf'
import { MyContext } from '../../SessionContext'
import { ProviderFactory } from '../../providers/ProviderFactory'
import { getChooseKeyboard } from '../../util/keyboards'

const { BaseScene, Stage } = Scenes
const { leave } = Stage

const setProvider = new BaseScene<MyContext>('setprovider')

setProvider.enter(async (ctx: MyContext) => {
    const providerFactory = new ProviderFactory()
    const providers = providerFactory.getAvailableProvidersNames()
    return await ctx.reply('Choose a provider:', getChooseKeyboard(providers))
})

setProvider.action(/^callbackName__/, async (ctx) => {
    const { callbackQuery } = ctx

    if (!('data' in callbackQuery)) {
        return await ctx.reply(`Wrong callback query`)
    }

    const providerName = callbackQuery.data.split('__')[1]
    ctx.session.options.providerName = providerName
    const model = new ProviderFactory()
        .getProviderByName(providerName)
        .getDefaultModel()
    ctx.session.options.model = model
    ctx.session.messages = []

    ctx.answerCbQuery()
    await ctx.reply(
        `Provider ${providerName} selected. Context reset performed.`
    )
    return leave()
})

export default setProvider
