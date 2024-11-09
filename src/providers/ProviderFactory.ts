import { Provider } from './Provider'
import G4Fprovider from './g4f/g4f'
import OpenAIprovider from './openai/openai'

export class ProviderFactory {
    private providers: Map<string, Provider>
    constructor() {
        this.providers = new Map()
        this.providers.set('OpenAI', new OpenAIprovider())
        this.providers.set('G4F', new G4Fprovider())
    }

    getProviderByName(name: string): Provider | null {
        return this.providers.get(name) || null
    }

    static getDefaultProvider(): Provider {
        return new OpenAIprovider()
    }

    getAvailableProvidersNames(): string[] {
        return Array.from(
            this.providers.keys()
        )
    }
}

