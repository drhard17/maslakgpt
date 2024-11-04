import { Scenes, Markup } from 'telegraf'
import { MyContext } from '../../bot'
const { BaseScene, Stage } = Scenes
import _ from 'lodash'

const { leave } = Stage;

const setModel = new BaseScene<MyContext>('setmodel')

setModel.enter(async (ctx: MyContext) => {
    const models: string[] = ctx.session.options.provider.getModels()
    return await ctx.reply('Choose a model:', {
        ...Markup.inlineKeyboard(
            _.chunk(
                models.map((model) => Markup.button.callback(model, `model__${model}`))
            , 2)
        )
    })
})

setModel.action(/^model_/, async (ctx) => {
    
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