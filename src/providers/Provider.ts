import { Messages } from '../SessionContext'

export abstract class Provider {
    abstract createCompletion(
        messages: Messages,
        options: {
            model: string
        }
    ): Promise<string>

    abstract getModels(): string[]

    getDefaultModel(): string {
        return this.getModels()[0]
    }
}
