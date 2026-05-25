import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';
import { getKeywordsSystemPrompt } from '../../prompts/v1/keywords.ts';

export function createResearcherNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🔍 Researcher processing...');
        const userQuestion = state.messages.at(-1)!.content as string;
        try {

            const result = await openRouterService.generateStructured(
                getKeywordsSystemPrompt(),
                userQuestion,
            );

            console.log('📊 Trends data fetched via tool call');

            return {
                trendsData: JSON.stringify(result.data, null, 2),
                question: userQuestion,
            };

        } catch (error) {
            console.error('Researcher error:', error);
            return {
                trendsData: 'Sorry, something went wrong while fetching trends data.',
                question: userQuestion,
            };
        }
    };
}
