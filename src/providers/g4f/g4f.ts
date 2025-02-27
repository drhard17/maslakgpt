import { Provider } from '../Provider'
import { G4F } from 'g4f'
import { models } from './models.json'
import { Message } from '../../SessionContext'

class G4Fprovider extends Provider {
    async createCompletion(
        messages: Message[],
        options: { model: string }
    ): Promise<string> {
        const g4f = new G4F()

        const g4fOptions = {
            provider: g4f.providers.GPT,
            model: options.model
        }

        let answer
        try {
            answer = await g4f.chatCompletion(messages, g4fOptions)
        } catch (error) {
            answer = `Service unavailable\n${error}`
        }
        return answer
    }

    getModels(): string[] {
        return models
    }
}

export default G4Fprovider
