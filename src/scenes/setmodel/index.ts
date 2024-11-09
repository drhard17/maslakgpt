import { Scenes } from 'telegraf'
import { MyContext } from '../../bot'
import { getChooseKeyboard } from '../../util/keyboards'

const { BaseScene, Stage } = Scenes
const { leave } = Stage

const setModel = new BaseScene<MyContext>('setmodel')

setModel.enter(async (ctx: MyContext) => {
    const models = ctx.session.options.provider.getModels()
    return await ctx.reply('Choose a model:', getChooseKeyboard(ctx, models))
})

setModel.action(/^callbackName__/, async (ctx) => {
    
    const { callbackQuery } = ctx

    if(!('data' in callbackQuery)) {
        return await ctx.reply(`Wrong model`)    
    }

    const model = callbackQuery.data.split('__')[1]    
    ctx.session.options.model = model
    ctx.session.messages = []
    ctx.answerCbQuery()
    await ctx.reply(`Model ${model} selected. Context reset performed`)
    return leave()
})

export default setModel