import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from 'zod/v3'
import { decrypt, encrypt } from "./service.ts";

export const server = new McpServer({
    name: '@erickwendel/ciphersuite-mcp',
    version: '0.0.1'
})

server.registerTool(
    'encrypt_message',
    {
        description: 'Encrypt a message',
        inputSchema: {
            message: z.string().describe("The message to encrypt"),
            encryptionKey: z.string().describe(
                "Any passphrase to use for encryption — the server derives a strong key from it automatically"
            )
        },
        outputSchema: {
            encryptedMessage: z.string().describe(
                "The encrypted message (format: iv:ciphertext)"
            )
        }
    },
    async ({ message, encryptionKey }) => {
        try {
            const encryptedMessage = encrypt(message, encryptionKey)
            return {
                content: [{ type: "text", text: encryptedMessage }],
                structuredContent: { encryptedMessage }
            }
        } catch (error) {
            return {
                isError: true,
                content: [{
                    type: 'text',
                    text: `Failed to encrypt message! Check if the message and encryption key are correct. Error details: ${error instanceof Error ? error.message : String(error)}`
                }]
            }
        }

    }
)

server.registerTool(
    'decrypt_message',
    {
        description: 'Decrypt a message that was encrypted with the encrypt_message tool',
        inputSchema: {
            encryptedMessage: z.string().describe("The encrypted message (format: iv:ciphertext)"),
            encryptionKey: z.string().describe("The same passphrase used during encryption")
        },
        outputSchema: {
            decryptedMessage: z.string().describe("The decrypted plain-text message")
        }
    },
    async ({ encryptedMessage, encryptionKey })=> {
        try {
            const decryptedMessage = decrypt(encryptedMessage, encryptionKey)
            return {
                content: [{ type: 'text', text: decryptedMessage }],
                structuredContent: { decryptedMessage }
            }

        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Failed to decrypt message! Check if the encrypted message is correct and if the encryption key matches the one used for encryption. Error details: ${error instanceof Error ? error.message : String(error)}`,

                    }
                ]
            }

        }
    }
)

server.registerResource(
    'encryption://info',
    'encryption://info',
    {
        description: 'Describes the encryption algorithm, key requirements, and output format used by this server',
    },
    () => ({
        contents: [
            {
                uri: "encryption://info",
                mimeType: "text/plain",
                text: `
Algorithm : AES-256-CBC
Key derivation: scrypt (passphrase + fixed server salt → 32-byte key)
Output format: <16-byte IV in hex>:<ciphertext in hex>  (separated by ":")
Notes:
  - Users pass any passphrase — the server derives a strong 32-byte key automatically using scrypt.
  - A random IV is generated for every encryption — the same message encrypted twice will produce different output.
  - Use the exact same passphrase to decrypt.
  - Keep the full "iv:ciphertext" string to decrypt later.
                `.trim(),
            },
        ]
    })
)

server.registerPrompt(
    "encrypt_message_prompt",
    {
        description: "Prompt to encrypt a plain-text message using the encrypt_message tool",
        argsSchema: {
            message: z.string().describe("The message to encrypt"),
            encryptionKey: z.string().describe(
                "Any passphrase to use for encryption — the server derives a strong key from it automatically"
            )
        }
    },
    ({ message, encryptionKey }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: "text",
                    text: `Please encrypt the following message using the encrypt_message tool.\nMessage: ${message}\nEncryption key: ${encryptionKey}`,
                }
            }
        ]
    })
)