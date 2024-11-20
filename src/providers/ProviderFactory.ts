import { Provider } from './Provider'
import G4Fprovider from './g4f/g4f'
import OpenAIprovider from './openai/openai'
import RaspGPTprovider from './raspGPT/RaspGPT'

export class ProviderFactory {
    private providers: Map<string, Provider>
    constructor() {
        this.providers = new Map()
        this.providers.set('OpenAI', new OpenAIprovider())
        this.providers.set('G4F', new G4Fprovider())
        this.providers.set('RaspGPT', new RaspGPTprovider())
    }

    getProviderByName(name: string): Provider {
        const provider = this.providers.get(name)
        if (!provider) {
            throw new Error(`Incorrect provider name ${name}`)
        }
        return provider
    }

    static getDefaultProvider(): Provider {
        return new OpenAIprovider()
    }

    static getDefaultProviderName(): string {
        return 'OpenAI'
    }

    getAvailableProvidersNames(): string[] {
        return Array.from(this.providers.keys())
    }
}
