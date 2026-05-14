import { buildChatGraph } from './graph.ts';

export async function buildGraph() {
    return buildChatGraph();
}

export const graph = () => buildChatGraph();
