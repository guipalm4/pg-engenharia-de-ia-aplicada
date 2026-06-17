import { describe, it, after, before } from 'node:test'
import assert from 'node:assert'
import { Client } from '@modelcontextprotocol/sdk/client'
import { createTestClient } from './helpers.ts'

async function encryptMessage(client: Client, message: string, encryptionKey: string) {
    const result = await client.callTool({
        name: 'encrypt_message',
        arguments: {
            message,
            encryptionKey,
        }
    }) as unknown as { structuredContent: { encryptedMessage: string }}

    return result
}

async function dencryptMessage(client: Client, encryptedMessage: string, encryptionKey: string) {
    const result = await client.callTool({
        name: 'decrypt_message',
        arguments: {
            encryptedMessage,
            encryptionKey,
        }
    }) as unknown as { structuredContent: { decryptedMessage: string }}

    return result
}

describe('MCP Tool Tests', () => {
    let client: Client
    let encryptionKey = 'my-super-passphrase'
    before(async () => {
        client = await createTestClient()
    })

    after(async ( ) => {
        await client.close()
    })

    it('should encrypt a message', async () => {
        const message = 'Hello world'
        const result = await encryptMessage(
            client,
            message,
            encryptionKey,
        )

        assert.ok(
            result.structuredContent?.encryptedMessage.length > 60,
            'Encrypted message should not be empty'
        )
    })
    it('should dencrypt a message', async () => {
         const message = 'Heyyyyy'
         const key = 'my-super-key'
        const { structuredContent: { encryptedMessage } } = await encryptMessage(
            client,
            message,
            key,
        )

        const result = await dencryptMessage(client, encryptedMessage, key)
        assert.deepStrictEqual(
            result.structuredContent.decryptedMessage,
            message,
            'Decrypted message should match original'
        )
    })

    it('should list the encryption://info resource', async () => {
        const { resources } = await client.listResources()
        const info = resources.find(item => item.uri === 'encryption://info')

        assert.ok(info, 'encryption://info resource should be listed!')
    })

    it('should return the encrypt_message_prompt', async () => {
        const result = await client.getPrompt({
            name: 'encrypt_message_prompt',
            arguments: {
                message: 'Secret text',
                encryptionKey,
            }
        })

        const item = result.messages.at(0)?.content as unknown as { text: string}
        const expected = `Please encrypt the following message using the encrypt_message tool.
Message: Secret text
Encryption key: my-super-passphrase`
        assert.deepStrictEqual(
             item.text,
             expected,
             'Prompt should be in the correct format'
        )
    })
})