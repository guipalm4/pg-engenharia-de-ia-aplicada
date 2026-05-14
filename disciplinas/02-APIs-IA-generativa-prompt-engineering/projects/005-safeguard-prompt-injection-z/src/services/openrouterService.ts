import { ChatOpenAI } from '@langchain/openai';
import { config, prompts, type ModelConfig } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createAgent } from 'langchain';
import { getMCPTools } from './mcpService.ts';
import { PromptTemplate } from '@langchain/core/prompts';

export type GuardrailResult = {
    safe: boolean;
    reason?: string;
    score?: number;
    analysis?: string;
};

export class OpenRouterService {
    private config: ModelConfig;
    private llmClient: ChatOpenAI;
    private safeGuardModel: ChatOpenAI;
    private fsAgent: ReturnType<typeof createAgent> | null = null;

    constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;
        this.llmClient = this.#createChatModel(this.config.models[0]);
        this.safeGuardModel = this.#createChatModel(this.config.guardrailsModel);
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
            const tools = await getMCPTools()
            this.fsAgent = createAgent({
                model: this.llmClient,
                tools,
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

    async checkGuardRails(
        userInput: string,
        enabled: boolean = true) {
        if (!enabled) {
            return { safe: true, reason: 'Guardrails disabled' }
        }

        const template = PromptTemplate.fromTemplate(prompts.guardrails)
        const input = await template.format({
            USER_INPUT: userInput,
        })
        const response = await this.safeGuardModel.invoke([
            {
                role: 'user',
                content: input,
            }
        ])
        const result = response.text.trim()
        const isUnsafe = result.toUpperCase().startsWith('UNSAFE')
        if (isUnsafe) {
            return {
                safe: false,
                reason: 'Prompt Injection detected by safeguard model',
                analysis: result,
            }
        }

        return {
            safe: true,
            analysis: result,
        }
    }

}
