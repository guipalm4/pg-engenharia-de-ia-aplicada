import { readFileSync } from 'fs';
import usersData from '../data/users.json' with { type: 'json' };

// User type
export type User = {
  username: string;
  role: 'admin' | 'member';
  permissions: string[];
  displayName: string;
};

// Users database
export const users: Record<string, User> = usersData as Record<string, User>;

export const prompts = {
  blocked: readFileSync('./prompts/blocked.txt', 'utf-8'),
  system: readFileSync('./prompts/system.txt', 'utf-8'),
  guardrails: readFileSync('./prompts/guardrails.txt', 'utf-8'),
}

// Model configuration type
export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;

  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };

  models: string[];
  temperature: number;
  maxTokens: number;
  guardrailsModel: string;

};

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Guardrails'!,
  models: [
    // 'qwen/qwen-2.5-7b-instruct',
    // 'qwen/qwen3-coder-next',
    // 'upstage/solar-pro-3:free',
    'qwen/qwen-2.5-7b-instruct',// unsafe!
  ],

  guardrailsModel: 'openai/gpt-oss-safeguard-20b',
  provider: {
    sort: {
      by: 'price',
      partition: 'none',
    },
  },
  temperature: 0.7,
  maxTokens: 1000,
};

// Get user by username
export function getUser(username: string): User | undefined {
  return users[username];
}
