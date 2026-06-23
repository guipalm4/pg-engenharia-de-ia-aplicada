import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const BASE_URL = "http://localhost:9999/v1";

export const server = new McpServer({
    name: "@erickwendel/ew-customers-mcp",
    version: "0.0.1",
});
