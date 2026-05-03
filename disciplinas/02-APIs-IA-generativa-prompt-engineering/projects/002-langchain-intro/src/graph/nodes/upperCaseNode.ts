import { type GraphState } from "../graph.ts";

export function upperCaseNode(state: GraphState): GraphState {
    const responseText = state.output.toUpperCase()

    return {
        ...state,
        output: responseText,
    }

}