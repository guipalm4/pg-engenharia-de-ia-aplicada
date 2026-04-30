import assert from "node:assert/strict";
import test from "node:test";
import { config } from "../src/config.ts";
import {
  type LLMResponse,
  OpenRouterService,
} from "../src/openrouterService.ts";
import { createServer } from "../src/server.ts";

console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in env variables",
);

test("routes to cheapest model by default", async () => {
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: "price",
      },
    },
  };
  const routerService = new OpenRouterService(customConfig);
  const app = createServer(routerService);

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    body: { question: "What is rate limiting?" },
  });
  assert.equal(response.statusCode, 200);
  const body = response.json() as LLMResponse;

  assert.equal(body.model, "nvidia/nemotron-3-nano-30b-a3b:free");
});

test("routes to highest throughput model by default", async () => {
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: "throughput",
      },
    },
  };
  const routerService = new OpenRouterService(customConfig);
  const app = createServer(routerService);

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    body: { question: "What is rate limiting?" },
  });
  assert.equal(response.statusCode, 200);
  const body = response.json() as LLMResponse;

  assert.equal(body.model, "nvidia/nemotron-3-nano-30b-a3b:free");
});
