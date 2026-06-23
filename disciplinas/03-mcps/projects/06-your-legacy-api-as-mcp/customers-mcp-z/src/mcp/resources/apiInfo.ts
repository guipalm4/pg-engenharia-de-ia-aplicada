import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerApiInfoResource(
    server: McpServer,
    baseUrl: string
){
    server.registerResource(
        "customers://api-info",
        "customers://api-info",
        {
            description: "describes the customers rest API that this MCP server wraps"
        },
        () => ({
            contents: [
                {
                    uri: "customers://api-info",
                    mimeType: "text/plain",
                    text: `
Customers API

  Base URL : ${baseUrl}
  Endpoints:
    GET    /customers          — list all customers
    GET    /customers/:id      — get customer by id
    POST   /customers          — create customer  { name, phone }
    PUT    /customers/:id      — update customer  { name, phone }
    DELETE /customers/:id      — delete customer

  Customer shape: { _id: string, name: string, phone: string }
`
                }
            ]
        })
    )
}