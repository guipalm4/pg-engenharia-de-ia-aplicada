import { getJson } from 'serpapi';
import type { SerpAPIConfig } from '../config.ts';
import { risingTrendFixture } from '../../data/trendingData.ts';

export type KeywordTrend = {
  keyword: string;
  searchVolume: number;
  interestOverTime: number;
  trend: 'rising' | 'stable' | 'declining';
};

export type RelatedQuery = {
  query: string;
  value: number;
};

export type RisingTopic = {
  topic: string;
  growth: number;
};

export type TrendingData = {
  keywords: KeywordTrend[];
  relatedQueries: RelatedQuery[];
  risingTopics: RisingTopic[];
  timestamp: string;
};

export class SerpAPIService {
  private config: SerpAPIConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: SerpAPIConfig) {
    this.config = {
      ...config,
    };
  }

  async getGoogleTrends(keywords: string[]): Promise<TrendingData> {
    console.log('🔍 Fetching Google Trends data for keywords:', keywords);
    if(this.config.disabled) {
      console.warn('⚠️  SerpAPIService is disabled. Returning fixture data.');
      return  risingTrendFixture;
    }

    const keywordTrends: KeywordTrend[] = [];
    const relatedQueriesSet = new Set<RelatedQuery>();
    const risingTopicsSet = new Set<RisingTopic>();

    for (const keyword of keywords) {
      try {
        console.log(`🔍 Fetching data for "${keyword}"...`);
        const trendsData = await this.fetchTrendsData(keyword);
        console.log(`🔍 Fetched trends for "${keyword}":`, trendsData);

        const keywordTrend = this.parseKeywordTrend(keyword, trendsData);
        if (keywordTrend) {
          keywordTrends.push(keywordTrend);
        }

        const relatedQueries = this.parseRelatedQueries(trendsData);
        relatedQueries.forEach(q => relatedQueriesSet.add(q));

        const risingTopics = this.parseRisingTopics(trendsData);
        risingTopics.forEach(t => risingTopicsSet.add(t));
      } catch (error: any) {
        console.warn(`⚠️  Failed to fetch trends for "${keyword}":`, error.message);
      }
    }

    return {
      keywords: keywordTrends.sort((a, b) => b.interestOverTime - a.interestOverTime),
      relatedQueries: Array.from(relatedQueriesSet).sort((a, b) => b.value - a.value).slice(0, 10),
      risingTopics: Array.from(risingTopicsSet).sort((a, b) => b.growth - a.growth).slice(0, 5),
      timestamp: new Date().toISOString(),
    };
  }

  private async fetchTrendsData(keyword: string): Promise<any> {
    return getJson({
      engine: 'google_trends',
      q: keyword,
      api_key: this.config.apiKey,
      date: 'now 7-d',
      data_type: 'TIMESERIES',
    });
  }

  private parseKeywordTrend(keyword: string, data: any): KeywordTrend | null {
    if (!data?.interest_over_time?.timeline_data) {
      return null;
    }

    const timelineData = data.interest_over_time.timeline_data;
    const values = timelineData.map((item: any) => item.values?.[0]?.extracted_value || 0);

    if (values.length === 0) {
      return null;
    }

    const avgInterest = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const recentValues = values.slice(-3);
    const earlyValues = values.slice(0, 3);
    const recentAvg = recentValues.reduce((sum: number, val: number) => sum + val, 0) / recentValues.length;
    const earlyAvg = earlyValues.reduce((sum: number, val: number) => sum + val, 0) / earlyValues.length;

    let trend: 'rising' | 'stable' | 'declining' = 'stable';
    if (recentAvg > earlyAvg * 1.2) {
      trend = 'rising';
    } else if (recentAvg < earlyAvg * 0.8) {
      trend = 'declining';
    }

    return {
      keyword,
      searchVolume: Math.max(...values),
      interestOverTime: Math.round(avgInterest),
      trend,
    };
  }

  private parseRelatedQueries(data: any): RelatedQuery[] {
    const queries: RelatedQuery[] = [];

    if (data?.related_queries?.top) {
      data.related_queries.top.forEach((item: any) => {
        if (item.query && item.value) {
          queries.push({
            query: item.query,
            value: item.value,
          });
        }
      });
    }

    if (data?.related_queries?.rising) {
      data.related_queries.rising.forEach((item: any) => {
        if (item.query && item.value) {
          queries.push({
            query: item.query,
            value: item.value,
          });
        }
      });
    }

    return queries;
  }

  private parseRisingTopics(data: any): RisingTopic[] {
    const topics: RisingTopic[] = [];

    if (data?.related_topics?.rising) {
      data.related_topics.rising.forEach((item: any) => {
        if (item.topic && item.value) {
          topics.push({
            topic: item.topic.title || item.topic,
            growth: typeof item.value === 'string' && item.value.includes('+')
              ? parseInt(item.value.replace(/\D/g, ''))
              : item.value,
          });
        }
      });
    }

    return topics;
  }

}
