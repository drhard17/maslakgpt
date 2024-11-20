import { Markup } from 'telegraf'
import _ from 'lodash'

export const getChooseKeyboard = (keys: string[]) => {
    return {
        ...Markup.inlineKeyboard(
            _.chunk(
                keys.map((key) =>
                    Markup.button.callback(key, `callbackName__${key}`)
                ),
                2
            )
        )
    }
}
