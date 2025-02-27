import { Provider } from '../Provider'
import { Message } from '../../SessionContext'
import { models } from './models.json'

class RaspGPTprovider extends Provider {
    async createCompletion(messages: Message[]): Promise<string> {
        throw new Error('No completion implementation')
    }

    getModels(): string[] {
        return models
    }
}

export default RaspGPTprovider
