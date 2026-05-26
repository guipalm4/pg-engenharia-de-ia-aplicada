export const config = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Document Q&A',
  models: [
    // Using a vision-capable model for multimodal document analysis
    'google/gemini-2.5-flash-lite-preview-09-2025',
    // Alternative models with vision support:
    // 'anthropic/claude-3.5-sonnet',
    // 'openai/gpt-4o',
    // 'google/gemini-pro-vision',
  ],
  provider: {
    sort: {
      by: 'throughput',
      partition: 'none',
    },
  },
  temperature: 0.7,
};

export default config

