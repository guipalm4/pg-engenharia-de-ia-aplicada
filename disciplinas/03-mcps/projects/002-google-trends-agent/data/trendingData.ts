import type { TrendingData } from '../src/services/serpApiService.ts';

export const risingTrendFixture: TrendingData = {
  keywords: [
    {
      keyword: 'TypeScript AI agents',
      searchVolume: 88,
      interestOverTime: 75,
      trend: 'rising',
    },
  ],
  relatedQueries: [
    { query: 'TypeScript LangChain tutorial', value: 100 },
    { query: 'AI agent typescript', value: 82 },
  ],
  risingTopics: [
    { topic: 'LangGraph agents', growth: 350 },
    { topic: 'AI development tools', growth: 180 },
  ],
  timestamp: '2026-02-27T00:00:00.000Z',
};

export const decliningTrendFixture: TrendingData = {
  keywords: [
    {
      keyword: 'jQuery tutorial',
      searchVolume: 30,
      interestOverTime: 22,
      trend: 'declining',
    },
  ],
  relatedQueries: [
    { query: 'jQuery vs React', value: 40 },
  ],
  risingTopics: [],
  timestamp: '2026-02-27T00:00:00.000Z',
};
