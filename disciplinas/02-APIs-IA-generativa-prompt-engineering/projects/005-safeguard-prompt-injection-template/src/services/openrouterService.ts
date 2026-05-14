import { ChatOpenAI } from '@langchain/openai';
import { config, type ModelConfig } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createAgent } from 'langchain';

export type GuardrailResult = {
    safe: boolean;
    reason?: string;
    score?: number;
    analysis?: string;
};

export class OpenRouterService {
    private config: ModelConfig;
    private llmClient: ChatOpenAI;
    private fsAgent: ReturnType<typeof createAgent> | null = null;

    constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;
        this.llmClient = this.#createChatModel(this.config.models[0]);
    }

    #createChatModel(modelName: string): ChatOpenAI {
        return new ChatOpenAI({
            apiKey: this.config.apiKey,
            modelName: modelName,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': this.config.httpReferer,
                    'X-Title': this.config.xTitle,
                },
            },
            modelKwargs: {
                models: this.config.models,
                provider: this.config.provider,
            },
        });
    }

    async generate(
        systemPrompt: string,
        userPrompt: string,
    ): Promise<string> {

        if (!this.fsAgent) {
            this.fsAgent = createAgent({
                model: this.llmClient,
                tools: [],
            });
        }

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        const response = await this.fsAgent.invoke({ messages });
        const content = String(response.messages.at(-1)?.text ?? '');

        return content;
    }

}
