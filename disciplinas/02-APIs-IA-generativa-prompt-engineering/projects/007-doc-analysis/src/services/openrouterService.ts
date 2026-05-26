import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export type LLMResponse = {
  model: string;
  content: string;
};

export class OpenRouterService {
  private llmClient: ChatOpenAI;

  constructor() {
    this.llmClient = new ChatOpenAI({
      apiKey: config.apiKey,
      modelName: config.models[0],
      temperature: config.temperature,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': config.httpReferer,
          'X-Title': config.xTitle,
        },
      },

      // Pass provider routing and models array to OpenRouter
      modelKwargs: {
        models: config.models,
        provider: config.provider,
      },
    });
  }

  async generateWithDocument(
    systemPrompt: string,
    userPrompt: string,
    documentBase64: string,
  ): Promise<LLMResponse> {
    try {

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage({
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${documentBase64}`,
              },
            },
          ],
        }),
      ];

      const response = await this.llmClient.invoke(messages);

      return {
        model: response.response_metadata?.model_name || config.models[0],
        content: response.content.toString(),
      };
    } catch (error) {
      throw new Error(`Multimodal generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

