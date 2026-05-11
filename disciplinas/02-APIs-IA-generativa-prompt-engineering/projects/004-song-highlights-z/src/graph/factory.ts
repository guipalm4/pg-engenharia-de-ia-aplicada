import { OpenRouterService } from '../services/openrouterService.ts';
import { config } from '../config.ts';
import { buildChatGraph } from './graph.ts';
import { createMemoryService } from '../services/memoryService.ts';
import { PreferencesService } from '../services/preferencesService.ts';

export async function buildGraph(dbPath: string = './preferences.db') {
  const llmClient = new OpenRouterService(config);

  const memoryService = await createMemoryService()
  const preferencesService = new PreferencesService(dbPath)
  const graph = buildChatGraph(
    llmClient,
    preferencesService,
    memoryService
  );

  return {
    graph,
    preferencesService,
  };
}

export const graph = async () => buildGraph();
export default graph;
