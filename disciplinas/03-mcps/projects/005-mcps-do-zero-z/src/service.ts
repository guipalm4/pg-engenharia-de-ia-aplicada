
import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'node:crypto';

const SALT = 'mcp-encrypter-salt';

function deriveKey(passphrase: string): Buffer {
    return scryptSync(passphrase, SALT, 32);
}

export function encrypt(text: string, key: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', deriveKey(key), iv);
    const encrypted = Buffer.concat([
        cipher.update(Buffer.from(text, 'utf8')),
        cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string, key: string): string {
    const [ivHex, ...rest] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(rest.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', deriveKey(key), iv);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
