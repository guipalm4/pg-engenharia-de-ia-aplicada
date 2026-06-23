import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomerService } from "../../application/customerService.ts";
import { CustomerMutationSchema, CustomerUpdateSchema } from "../../domain/customer.ts";
import { z } from 'zod'
export function registerDeleteCustomersTool(
    server: McpServer,
    service: CustomerService
) {

    server.registerTool(
        "delete_customer",
        {
            description: "Delete a customer by their _id",

            inputSchema: {
                _id: z.string().describe('MongoDB ObjectID of the customer to delete')
            },
            outputSchema: CustomerMutationSchema.shape,
        },
        async ({ _id }) => {
            try {
                const result = await service.deleteCustomer(_id)
                return {
                    content: [
                        {
                            type: "text",
                            text: result.message ?? ""
                        }
                    ],
                    structuredContent: result
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