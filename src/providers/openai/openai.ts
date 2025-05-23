import OpenAI from 'openai'
import { Provider } from '../Provider'
import { models } from './models.json'
import { Message } from '../../SessionContext'

class OpenAIprovider extends Provider {
    async createCompletion(
        messages: Message[],
        options: { model: string }
    ): Promise<string> {
        const openai = new OpenAI()
        try {
            const completion = await openai.chat.completions.create({
                model: options.model,
                messages
            })
            return (
                completion.choices[0].message.content ||
                'Service error - null msg'
            )
        } catch (error) {
            return `Service unavailable\n${error}`
        }
    }

    getModels(): string[] {
        return models
    }
}

export default OpenAIprovider
