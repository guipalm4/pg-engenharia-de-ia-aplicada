import { ChatOpenAI } from '@langchain/openai';
import { config, type ModelConfig } from '../config.ts';
import { SystemMessage, HumanMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { createAgent, providerStrategy } from 'langchain';
import { getMCPTools } from './mcpService.ts';
import { z } from 'zod/v3';
import { type ChatGeneration } from '@langchain/core/outputs';

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

    async #getTools() {
        if (!this.tools.length) {
            this.tools = await getMCPTools();
        }
        return this.tools;
    }

    async generateStructured<T>(
        systemPrompt: string,
        userPrompt: string,
        schema?: z.ZodSchema<T>,
    ): Promise<{ data?: T | string; }> {
        const agentConfig = schema
            ? { responseFormat: providerStrategy(schema), tools: [] }
            : { tools: await this.#getTools() };

        const agent = createAgent({
            ...agentConfig,
            model: this.llmClient,
        });

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        const data = await agent.invoke(
            {
                messages
            },
            {
                callbacks: [{
                    handleChatModelStart(_llm, promptMessages) {
                        const lastMsg = promptMessages.at(-1)?.at(-1);
                        console.log(`\n🧠 LLM thinking...`);
                        console.log(` (last message: "${lastMsg?.content?.toString()}")`);
                    },
                    handleLLMEnd(output) {
                        const msg = (output.generations?.at(0)?.at(0) as ChatGeneration)?.message as AIMessage;
                        const toolCalls = msg?.tool_calls;
                        if (toolCalls?.length) {
                            console.log(`🎯 Decided to call: ${toolCalls.map((t) => t.name).join(', ')}`);
                        }
                    },
                    handleToolStart(_tool, input, _runId, _parentRunId, _tags, _metadata, runName) {
                        console.log(`🔧 Tool called: ${runName} →`, input);
                    },
                    handleToolEnd(output, _runId, _parentRunId, runName) {
                        console.log(`✅ Tool done:   ${runName} →`, output);
                    },
                }]
            });
        console.log('✅ LLM Response:', JSON.stringify(data, null, 2));

        return {
            data: (schema ?
                ((data as any).structuredResponse as T) :
                data.messages.at(-1)?.text as string ?? ""
            ),
        };
    }
}
