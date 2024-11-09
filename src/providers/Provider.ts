export type Roles = 'system' | 'user' | 'assistant' // | 'tool' | 'function'

export abstract class Provider {
    // readonly abstract providerName: string
    abstract createCompletion(messages: {
        role: Roles,
        content: string,
        name?: string
    }[]): Promise<string>

    abstract getModels(): string[]
}