export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;

  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };

  models: string[];
  temperature: number;
  maxTokens: number;
  serpAPIConfig: SerpAPIConfig;
};

console.assert(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY is not set in environment variables');
console.assert(process.env.SERPAPI_API_KEY, 'SERPAPI_API_KEY is not set in environment variables');

export type SerpAPIConfig = {
  apiKey: string;
  cacheTTL?: number;
  disabled?: boolean;
};


export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Transforming Services into Tools',
  models: [
    // 'openai/gpt-oss-120b:free',
    'arcee-ai/trinity-large-preview:free',
    // 'qwen/qwen3-next-80b-a3b-instruct:free',
    // 'mistralai/mistral-small-3.1-24b-instruct:free',
    // 'qwen/qwen3-coder-next'
  ],
  provider: {
    sort: {
      by: 'throughput', // Route to model with highest throughput (fastest response)
      partition: 'none',
    },
  },
  temperature: 0.7,
  maxTokens: 2048,
  serpAPIConfig: {
    apiKey: process.env.SERPAPI_API_KEY!,
    cacheTTL: 3600000, // 1 hour in milliseconds
    disabled: false,
    // disabled: true,
  },
};
