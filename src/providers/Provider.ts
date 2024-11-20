export type Roles = 'system' | 'user' | 'assistant' // | 'tool' | 'function'

export abstract class Provider {
    abstract createCompletion(
        messages: {
            role: Roles
            content: string
            name?: string
        }[],
        options: {
            model: string
        }
    ): Promise<string>

    abstract getModels(): string[]

    getDefaultModel(): string {
        return this.getModels()[0]
    }
}
