import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { createTestClient } from '../helpers.ts'
import { Client } from '@modelcontextprotocol/sdk/client'
import { type CustomerUpdate, type Customer, type CustomerMutation } from '../../src/domain/customer.ts'

type CustomersResult = { structuredContent: { customers: Customer[] } }
type CustomerResult = { structuredContent: { customer: Customer } }
type CustomerMutationResult = { structuredContent: CustomerMutation }

describe('Customer MCP Suite', () => {
    let client: Client

    before(async () => {
        client = await createTestClient()
    })
    after(async () => {
        await client.close()
    })

    it('should list all customers', async () => {
        const result = await client.callTool({
            name: 'list_customers',
            arguments: {}
        }) as unknown as CustomersResult

        assert.ok(
            Array.isArray(result.structuredContent.customers),
            'Should return an array of customers'
        )
    })

    it('should create a customer', async () => {
        const customer = {
            name: 'Ana',
            phone: '999-000-111'
        }

        const result = await client.callTool({
            name: 'create_customer',
            arguments: customer
        }) as unknown as CustomerMutationResult

        assert.ok(result.structuredContent.id,
            'Should contain id'
        )
        assert.deepStrictEqual(
            result.structuredContent.message,
            `user ${customer.name} created!`,
        )
    })


    it('should update a customer', async () => {
        const customer = {
            name: 'Xuxa da Silva',
            phone: '12331236'
        }

        const { structuredContent: { id } } = await client.callTool({
            name: 'create_customer',
            arguments: customer
        }) as unknown as CustomerMutationResult

        const result = await client.callTool({
            name: 'update_customer',
            arguments: {
                _id: id,
                name: 'Jozé da silva',
                phone: customer.phone,
            } as CustomerUpdate
        }) as unknown as CustomerMutationResult

        assert.ok(result.structuredContent.message,
            'Should contain message'
        )

        assert.deepStrictEqual(
            result.structuredContent.id,
            id,
        )
    })

    it('should delete a customer', async () => {
        const customer = {
            name: 'Mariazina',
            phone: '654566456'
        }

        const { structuredContent: { id } } = await client.callTool({
            name: 'create_customer',
            arguments: customer
        }) as unknown as CustomerMutationResult

        const result = await client.callTool({
            name: 'delete_customer',
            arguments: {
                _id: id,
            } as CustomerUpdate
        }) as unknown as CustomerMutationResult

        assert.deepStrictEqual(
            result.structuredContent.message,
            `User ${id} deleted!`,
            'Should show deleted message'
        )

        assert.deepStrictEqual(
            result.structuredContent.id,
            id,
        )
    })

})