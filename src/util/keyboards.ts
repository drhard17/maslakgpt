import { Markup } from 'telegraf'
import { MyContext } from '../bot'
import _ from 'lodash'

export const getChooseKeyboard = (ctx: MyContext, keys: string[]) => {
    return         {...Markup.inlineKeyboard(
        _.chunk(
            keys.map((key) => Markup.button.callback(key, `callbackName__${key}`))
        , 2)
    )}
}