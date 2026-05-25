import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { SerpAPIService } from '../services/serpApiService.ts';

export function createGoogleTrendsTool(serpAPIService: SerpAPIService) {
  return tool(
    async ({ keywords }) => {
      const data = await serpAPIService.getGoogleTrends(keywords);
      return JSON.stringify(data);
    },
    {
      name: 'google_trends',
      description:
        'Get Google Trends data for a list of keywords. Use this to analyze if a video title or topic is trending, rising, or declining in popularity. Always call this when the user shares a video title idea.',
      schema: z.object({
        keywords: z.array(z.string()).describe('Keywords extracted from the video title to analyze'),
      }),
    },
  );
}
