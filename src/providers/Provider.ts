import { Message } from '../SessionContext'

export abstract class Provider {
    abstract createCompletion(
        messages: Message[],
        options: {
            model: string
        }
    ): Promise<string>

    abstract getModels(): string[]

    getDefaultModel(): string {
        return this.getModels()[0]
    }
}
