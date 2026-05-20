import { OpenRouterService } from '../services/openrouterService.ts';
import { Neo4jService } from '../services/neo4jService.ts';
import { buildSalesGraph } from './graph.ts';

export function buildSalesQAGraph() {
  const llmClient = new OpenRouterService();
  const neo4jService = new Neo4jService();
  return {
    graph: buildSalesGraph(llmClient, neo4jService),
    llmClient,
    neo4jService,
  }
}

export const graph = buildSalesQAGraph();
