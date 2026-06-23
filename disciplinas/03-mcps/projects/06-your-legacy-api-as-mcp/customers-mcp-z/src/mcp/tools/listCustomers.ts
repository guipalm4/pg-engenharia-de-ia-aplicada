import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomerService } from "../../application/customerService.ts";
import z from "zod";
import { CustomerSchema } from "../../domain/customer.ts";



export function registerListCustomersTool(
    server: McpServer,
    service: CustomerService
) {

    server.registerTool(
        "list_customers",
        {
            description: "List all customers",
            inputSchema: {},
            outputSchema: {
                customers: z.array(
                    CustomerSchema
                ).describe('Array of all customers')
            }
        },
        async () => {
            try {
                const customers = await service.listCustomers()
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(customers, null, 2)
                        }
                    ],
                    structuredContent: { customers }
                }
            } catch (error) {
                  return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Failed to list customers. Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    )
}