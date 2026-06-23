import { type CustomerMutation, type Customer, type CustomerUpdate } from "../domain/customer.ts"

export class CustomerHttpClient {
    private baseUrl: string
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    async listCustomers(): Promise<Customer[]> {
        const res = await fetch(`${this.baseUrl}/customers`)
        return res.json() as Promise<Customer[]>
    }

    async createCustomer(customer: Customer) {
        const res = await fetch(`${this.baseUrl}/customers`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer),
        })
        return res.json() as Promise<CustomerMutation>
    }

    async getCustomerById(id: string): Promise<Customer | null> {
        const res = await fetch(`${this.baseUrl}/customers/${id}`)
        if (res.status === 404) return null

        return res.json() as Promise<Customer>
    }

    async updateCustomer(customer: CustomerUpdate) {
        const {_id, ...remaining } = customer
        const res = await fetch(`${this.baseUrl}/customers/${_id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(remaining),
        })

        return res.json() as Promise<CustomerMutation>
    }

    async deleteCustomer(id: string): Promise<CustomerMutation> {
        const response = await fetch(`${this.baseUrl}/customers/${id}`, {
            method: "DELETE"
        })

        return response.json() as Promise<CustomerMutation>
    }
}