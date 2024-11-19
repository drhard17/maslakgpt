export type Roles = 'system' | 'user' | 'assistant' // | 'tool' | 'function'

export abstract class Provider {
    // readonly abstract providerName: string
    protected model: string
    constructor() {
        this.model = this.getDefaultModel()
    }

    abstract createCompletion(
        messages: {
            role: Roles
            content: string
            name?: string
        }[],
        options: {}
    ): Promise<string>

    abstract getModels(): string[]

    getDefaultModel(): string {
        return this.getModels()[0]
    }

    setDefaultModel() {
        this.model = this.getDefaultModel()
    }

    setModel(model: string) {
        if (!this.getModels().includes(model)) {
            throw new Error('Wrong model')
        }
        this.model = model
    }
}
