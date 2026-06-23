import z from "zod";

export const CustomerSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    phone: z.string(),
})
export type Customer = z.infer<typeof CustomerSchema>

export const CustomerQuerySchema = z.object({
    _id: z.string().optional().describe("MongoDB ObjectId of the customer"),
    name: z.string().optional().describe('Full name of the customer'),
    phone: z.string().optional().describe('phone number of the customer')
})
export type CustomerQuery = z.infer<typeof CustomerQuerySchema>


export const CustomerUpdateSchema = CustomerQuerySchema.extend({
    _id: z.string().describe("MongoDB ObjectId of the customer"),
})

export type  CustomerUpdate = z.infer<typeof CustomerUpdateSchema>


export const CustomerMutationSchema = z.object({
    id: z.string().optional().describe("MongoDB ObjectId of the customer"),
    message: z.string().optional().describe('Confirmation message'),
    isError: z.boolean().optional().describe('Indicates if an error occurred'),

        /* FIX: Tinham faltado estes abaixo para previnir o erro de:
    "   Structured content does not match tool's output schema:
        data must NOT have additional properties"
    */
    customer: CustomerSchema.optional().describe("The found customer"),
    customers: z.array(CustomerSchema).optional().describe("List of customers"),
})

export type CustomerMutation = z.infer<typeof CustomerMutationSchema>