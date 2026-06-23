import { type CustomerQuery, type Customer, type CustomerUpdate } from "../domain/customer.ts";
import { CustomerHttpClient } from "../infrastructure/customerHttpClient.ts";

export class CustomerService {
    private readonly client: CustomerHttpClient
    constructor(baseUrl: string) {
        this.client = new CustomerHttpClient(baseUrl)
    }

    async listCustomers(): Promise<Customer[]> {
        return this.client.listCustomers()
    }

    async createCustomer(customer: Omit<Customer, '_id'>) {
        return this.client.createCustomer(customer)
    }

    async findCustomer(query: CustomerQuery): Promise<Customer | null> {
        if(query._id) return this.client.getCustomerById(query._id)

        const customers = await this.client.listCustomers()
        return (
            customers.find(customer => {
                const entries = Object.entries(query) as [keyof Customer, string][]

                return entries.every(([key, value]) => {
                    const customerValue = customer[key]
                    return customerValue?.includes(value)
                })
            })
        ) ?? null
    }

    async updateCustomer(customer: CustomerUpdate) {
        return this.client.updateCustomer(customer)
    }

    async deleteCustomer(id: string) {
        return this.client.deleteCustomer(id)
    }
}
