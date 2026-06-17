import { decrypt, encrypt } from "./service.ts";

async function main() {
    const myMessage = "Hello, World!";
    const encryptionKey = "my-secret-passphrase";

    const encryptedMessage = encrypt(myMessage, encryptionKey);
    console.log("Encrypted message:", encryptedMessage);
    const decryptedMessage = decrypt(encryptedMessage, encryptionKey);
    console.log("Decrypted message:", decryptedMessage);
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});