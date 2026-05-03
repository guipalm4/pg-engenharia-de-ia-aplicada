import { AIMessage, SystemMessage } from "langchain";
import { type GraphState } from "../graph.ts";

export function fallbackNode(state: GraphState): GraphState {
  const message = "Unknown command. Try 'make this uppercase' or 'convert to lowercase'";
  const fallbackMessage = new AIMessage(message).content.toString()
    return {
        ...state,
        output: fallbackMessage,
        messages: [
            ...state.messages,
            // new SystemMessage('hey there')
        ]
    }

}