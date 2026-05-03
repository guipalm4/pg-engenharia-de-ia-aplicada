import { type GraphState } from "../graph.ts";

export function lowerCaseNode(state: GraphState): GraphState {
    const responseText = state.output.toLowerCase()

    return {
        ...state,
        output: responseText,
    }

}