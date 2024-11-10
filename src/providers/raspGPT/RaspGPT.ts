import { Provider, Roles } from '../Provider'
import { models } from './models.json'

class RaspGPTprovider extends Provider {
    
    async createCompletion(messages: { role: Roles; content: string; }[]): Promise<string> {
        throw new Error('No completion implementation')
    }

    getModels(): string[] {
        return models
    }
}

export default RaspGPTprovider