require('dotenv').config()
import OpenAI from 'openai'
import Provider, { Roles } from '../Provider'
import { models } from './models.json'

class OpenAIprovider extends Provider {

    async createCompletion(messages: { role: Roles; content: string; name?: string }[]): Promise<string> {

        const openai = new OpenAI()

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages
            })
            return completion.choices[0].message.content || 'NULL MSG'
        } catch (error) {
            return `Сервис OpenAI недоступен\n${error}`
        }
    }

    getModels(): string[] {
        return models
    }
}

export default OpenAIprovider