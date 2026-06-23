import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomerService } from "../../application/customerService.ts";
import { type CustomerQuery, CustomerQuerySchema, CustomerSchema } from "../../domain/customer.ts";

export function registerGetCustomerTool(
    server: McpServer,
    service: CustomerService
) {

    server.registerTool(
        "get_customer",
        {
            description: "Find a customer by _id, name, or phone number",
            inputSchema: CustomerQuerySchema,
            outputSchema: {
                customer: CustomerSchema.nullable()
                    .describe('Customer details if found, otherwise null!'),
            }
        },
        async (query: CustomerQuery) => {
            try {

                const customer = await service.findCustomer(query)
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(customer)
                        }
                    ],
                    structuredContent: { customer }
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