export type Provider = 'chatgpt' | 'perplexity' | 'claude';

export interface SearchResult {
    rank: number;
    content: string;
}

export interface SearchParams {
    query: string;
    location?: string;
    url: string; // The URL to check ranking for
}

abstract class LLMProvider {
    abstract name: Provider;
    abstract checkRanking(params: SearchParams): Promise<SearchResult>;
}

class ChatGPTProvider extends LLMProvider {
    name: Provider = 'chatgpt';
    async checkRanking(params: SearchParams): Promise<SearchResult> {
        // Mock implementation
        console.log(`Checking ChatGPT for ${params.query} in ${params.location}`);
        return {
            rank: Math.floor(Math.random() * 10) + 1,
            content: `Simulated ChatGPT response mentioning ${params.url} for ${params.query}`,
        };
    }
}

class PerplexityProvider extends LLMProvider {
    name: Provider = 'perplexity';
    async checkRanking(params: SearchParams): Promise<SearchResult> {
        // Mock implementation
        console.log(`Checking Perplexity for ${params.query} in ${params.location}`);
        return {
            rank: Math.floor(Math.random() * 5) + 1,
            content: `Simulated Perplexity citations including ${params.url}`,
        };
    }
}

class ClaudeProvider extends LLMProvider {
    name: Provider = 'claude';
    async checkRanking(params: SearchParams): Promise<SearchResult> {
        // Mock implementation
        console.log(`Checking Claude for ${params.query} in ${params.location}`);
        return {
            rank: Math.floor(Math.random() * 20) + 1,
            content: `Simulated Claude analysis referencing ${params.url}`,
        };
    }
}

export const providers: Record<Provider, LLMProvider> = {
    chatgpt: new ChatGPTProvider(),
    perplexity: new PerplexityProvider(),
    claude: new ClaudeProvider(),
};

export async function checkAllProviders(params: SearchParams) {
    const results = await Promise.all(
        Object.values(providers).map(async (provider) => {
            try {
                const result = await provider.checkRanking(params);
                return { provider: provider.name, ...result };
            } catch (error) {
                console.error(`Error checking ${provider.name}`, error);
                return { provider: provider.name, rank: -1, content: 'Error' };
            }
        })
    );
    return results;
}
