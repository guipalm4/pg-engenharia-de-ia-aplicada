import { config } from '../config.ts';
import { AppointmentService } from '../services/appointmentService.ts';
import { OpenRouterService } from '../services/openRouterService.ts';
import { buildAppointmentGraph } from './graph.ts';

export function buildGraph() {
  const llmClient = new OpenRouterService(config)
  const appointmentService = new AppointmentService()
  return buildAppointmentGraph(
    llmClient,
    appointmentService,
  );
}

export const graph = async () => {
  return buildGraph();
};
