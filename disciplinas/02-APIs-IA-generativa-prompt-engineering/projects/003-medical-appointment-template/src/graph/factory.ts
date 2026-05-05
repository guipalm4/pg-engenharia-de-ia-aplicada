import { buildAppointmentGraph } from './graph.ts';

export function buildGraph() {
  return buildAppointmentGraph();
}

export const graph = async () => {
  return buildGraph();
};

export default graph;
