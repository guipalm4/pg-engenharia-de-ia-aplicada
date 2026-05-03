import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from '../src/server.ts'


test('command upper transforms message into UPPERCASE', async () => {
    const app = createServer()
    const msg = 'make THis message UPPER please!'
    const expected = msg.toUpperCase()
    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body:{ question: msg }
    })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, expected)
})

test('command upper transforms message into LOWERCASE', async () => {
    const app = createServer()
    const msg = 'MAKE THIS MESSAGE LOWER PLEASE!'
    const expected = msg.toLowerCase()
    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body:{ question: msg }
    })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, expected)
})

test('command upper transforms message into UNKNOWN', async () => {
    const app = createServer()
    const msg = 'HEY THERE!'
    const expected = "Unknown command. Try 'make this uppercase' or 'convert to lowercase'"
    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body:{ question: msg }
    })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, expected)
})