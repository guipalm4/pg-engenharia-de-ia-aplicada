import type { GraphState } from '../state.ts';

/**
 * Route after guardrails check
 * - If guardrails disabled, go to chat
 * - If guardrails enabled and safe, go to chat
 * - If guardrails enabled and unsafe, go to blocked
 */
export function routeAfterGuardrails(state: GraphState): 'chat' | 'blocked' {
  // If guardrails disabled, go straight to chat
  if (!state.guardrailsEnabled) {
    return 'chat';
  }

  // If guardrails enabled, check result
  const check = state.guardrailCheck;
  if (!check || check.safe) {
    return 'chat';
  }

  return 'blocked';
}
