import { Scenes, Context } from 'telegraf'

type AllRoles = 'system' | 'user' | 'assistant' | 'tool' | 'function'
type Roles = Exclude<AllRoles, 'tool' | 'function'>

export type Messages = {
    role: Roles
    content: string
    name?: string
}[]

export interface MySession extends Scenes.SceneSession {
    messages: Messages
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
}
