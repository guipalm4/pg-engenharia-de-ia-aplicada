import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListCustomersTool } from "./tools/listCustomers.ts";
import { CustomerService } from "../application/customerService.ts";
import { registerApiInfoResource } from "./resources/apiInfo.ts";
import { registerCreateCustomersTool } from "./tools/createCustomer.ts";
import { registerGetCustomerTool } from "./tools/getCustomer.ts";
import { registerFindCustomerPrompt } from "./prompts/findCustomer.ts";
import { registerUpdateCustomersTool } from "./tools/updateCustomer.ts";
import { registerDeleteCustomersTool } from "./tools/deleteCustomer.ts";

const BASE_URL = "http://localhost:9999/v1";
const service = new CustomerService(BASE_URL)

export const server = new McpServer({
    name: "@erickwendel/ew-customers-mcp",
    version: "0.0.1",
});

registerListCustomersTool(server, service)
registerGetCustomerTool(server, service)
registerCreateCustomersTool(server, service)
registerFindCustomerPrompt(server)
registerApiInfoResource(server, BASE_URL)
registerUpdateCustomersTool(server, service)
registerDeleteCustomersTool(server, service)