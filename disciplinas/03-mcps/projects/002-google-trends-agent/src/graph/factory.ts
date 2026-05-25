import { buildTrendsGraph } from './graph.ts';
import { OpenRouterService } from '../services/openRouterService.ts';

export async function buildGraph() {
  const llm = new OpenRouterService();
  return buildTrendsGraph(llm);
}

export const graph = async () => {
  return buildGraph();
};

export default graph;
