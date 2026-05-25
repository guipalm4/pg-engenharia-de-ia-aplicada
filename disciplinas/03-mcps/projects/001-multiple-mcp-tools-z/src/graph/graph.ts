import { StateGraph, START, END } from '@langchain/langgraph';
import { intentNode } from './nodes/intentNode.ts';
import { agentNode } from './nodes/agentNode.ts';
import { OpenRouterService } from '../services/openRouterService.ts';
import { GraphAnnotation, type GraphState } from './state.ts';

export function buildGraphPipeline(openRouterService: OpenRouterService) {
  return new StateGraph(GraphAnnotation)
    .addNode('intentParser', intentNode(openRouterService))
    .addNode('agent', agentNode(openRouterService))

    .addEdge(START, 'intentParser')
    .addConditionalEdges('intentParser', (state: GraphState) =>
      state.error ? END : 'agent'
    )
    .addEdge('agent', END)

    .compile();
}
