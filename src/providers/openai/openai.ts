require('dotenv').config()
import OpenAI from 'openai'
import { Provider, Roles } from '../Provider'
import { models } from './models.json'

class OpenAIprovider extends Provider {
    async createCompletion(
        messages: { role: Roles; content: string; name?: string }[],
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
