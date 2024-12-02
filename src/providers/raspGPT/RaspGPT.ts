import { Provider } from '../Provider'
import { Messages } from '../../SessionContext'
import { models } from './models.json'

class RaspGPTprovider extends Provider {
    async createCompletion(messages: Messages): Promise<string> {
        throw new Error('No completion implementation')
    }

    getModels(): string[] {
        return models
    }
}

export default RaspGPTprovider
