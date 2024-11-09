import { Provider, Roles } from '../Provider'
import { G4F } from 'g4f'
import { models } from './models.json'

class G4Fprovider extends Provider {
    
    async createCompletion(messages: { role: Roles; content: string; }[]): Promise<string> {
        const g4f = new G4F()
        let answer
        try {
            answer = await g4f.chatCompletion(messages)
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