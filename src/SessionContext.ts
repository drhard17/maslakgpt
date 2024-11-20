import { Scenes, Context } from 'telegraf'
import { Roles } from './providers/Provider'

export interface MySession extends Scenes.SceneSession {
    messages: {
        role: Roles
        content: string
    }[]
    options: {
        providerName: string
        model: string
        markdown: boolean
    }
}

export interface MyContext extends Context {
    session: MySession
    scene: Scenes.SceneContextScene<MyContext>
}

export const initSession = (ctx: MyContext) => {
    ctx.session.messages ??= []
    ctx.session.options ??= {
        providerName: 'OpenAI',
        model: 'gpt-4o',
        markdown: false
    }
    return ctx
}
