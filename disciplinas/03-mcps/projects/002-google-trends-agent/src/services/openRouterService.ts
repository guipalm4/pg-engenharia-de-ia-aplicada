import { ChatOpenAI } from '@langchain/openai';
import { config, type ModelConfig } from '../config.ts';
import { SystemMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { createAgent, providerStrategy } from 'langchain';
import { getMCPTools } from './mcpService.ts';
import { z } from 'zod/v3';

export class OpenRouterService {
    private config: ModelConfig;
    private llmClient: ChatOpenAI;
    private tools: any[];

    constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;
        this.llmClient = this.#createChatModel(this.config.models[0]);
        this.tools = [];
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

    async generateStructured<T>(
        systemPrompt: string,
        userPrompt: string,
        schema?: z.ZodSchema<T>,
    ): Promise<{ data?: T | string; }> {
        if (!this.tools.length) {
            this.tools = await getMCPTools();
        }

        const agentConfig = schema ?
            {
                responseFormat: providerStrategy(schema),
                tools: []
            }
            : { tools: this.tools };

        const agent = createAgent({
            ...agentConfig,
            model: this.llmClient,
        });

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        const data = await agent.invoke({ messages });
        console.log('✅ LLM Response:', JSON.stringify(data, null, 2));

        return {
            data: (schema ?
                ((data as any).structuredResponse as T) :
                data.messages.at(-1)?.text
            ),
        };
    }
}
