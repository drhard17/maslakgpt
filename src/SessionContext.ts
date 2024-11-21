import { Scenes, Context } from 'telegraf'
import { Provider, Roles } from './providers/Provider'
import { ProviderFactory } from './providers/ProviderFactory'

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
    provider: Provider
}

export const initSession = (ctx: MyContext) => {
    ctx.session.messages ??= []
    ctx.session.options ??= {
        providerName: 'OpenAI',
        model: 'gpt-4o',
        markdown: false
    }
    ctx.provider = new ProviderFactory().getProviderByName(
        ctx.session.options.providerName
    )
    ctx.provider.setModel(ctx.session.options.model)
}
