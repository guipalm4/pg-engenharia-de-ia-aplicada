import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';

export const createGuardrailsCheckNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {

            return {
                ...state,
            };
        } catch (error) {
            console.error('Guardrails check failed:', error);

            return {
                ...state,
            };
        }
    }
}
