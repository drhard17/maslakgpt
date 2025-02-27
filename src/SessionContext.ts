import { Scenes, Context } from 'telegraf'

type AllRoles = 'system' | 'user' | 'assistant' | 'tool' | 'function'
type Roles = Exclude<AllRoles, 'tool' | 'function'>

export type Message = {
    role: Roles
    content: string
    name?: string
}

export type Conversation = {
    tag: string
    current: boolean
    messages: Message[]
}

export interface MySession extends Scenes.SceneSession {
    conversations: Conversation[]
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
    ctx.session.conversations ??= [
        {
            tag: 'start',
            current: true,
            messages: []
        }
    ]
    ctx.session.options ??= {
        providerName: 'OpenAI',
        model: 'gpt-4o',
        markdown: false
    }
}
