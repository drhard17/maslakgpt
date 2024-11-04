abstract class Provider {
    // readonly abstract providerName: string
    public abstract createCompletion(messages: {
        role: Roles,
        content: string,
        name?: string
    }[]): Promise<string>

    // getModels(): string[] {
    //     const { models } = require(`${__dirname}/${this.providerName}/models.json`)
    //     return models
    // }
    abstract getModels(): string[]
}

export type Roles = 'system' | 'user' | 'assistant' // | 'tool' | 'function'
export default Provider