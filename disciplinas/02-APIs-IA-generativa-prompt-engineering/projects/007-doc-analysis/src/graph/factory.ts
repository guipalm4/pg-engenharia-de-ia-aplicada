import { OpenRouterService } from '../services/openrouterService.ts';
import { buildDocumentQAGraph } from './graph.ts';

export function buildDocumentQAGraphInstance() {
  const llmClient = new OpenRouterService();
  return {
    graph: buildDocumentQAGraph(llmClient),
    llmClient,
  }
}

export const graph = buildDocumentQAGraphInstance();
