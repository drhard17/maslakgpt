export type Roles = 'system' | 'user' | 'assistant' // | 'tool' | 'function'

export abstract class Provider {
    model: string
    constructor() {
        this.model = this.getDefaultModel()
    }
    abstract createCompletion(
        messages: {
            role: Roles
            content: string
            name?: string
        }[]
    ): Promise<string>

    abstract getModels(): string[]

    getDefaultModel(): string {
        return this.getModels()[0]
    }

    setModel(model: string) {
        if (!this.getModels().includes(model)) {
            throw new Error('Wrong model')
        }
        this.model = model
    }
}
