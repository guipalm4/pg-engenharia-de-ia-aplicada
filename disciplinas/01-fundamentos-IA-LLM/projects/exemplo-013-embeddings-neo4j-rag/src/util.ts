import type { Document } from "@langchain/core/documents";

function displayResults(results: Array<Document<Record<string, any>>>): void {
    console.log(`\n📄 Encontrados ${results.length} trechos relevantes:\n`);

    results.forEach((doc, index) => {
        console.log(`   ${index + 1}.`);
        console.log(`      ${formatContent(doc.pageContent)}`);
        if (doc.metadata?.pageNumber) {
            console.log(`      📄 (Página: ${doc.metadata.pageNumber})`);
        }
        console.log();
    });
}

function formatContent(content: string, maxLength: number = 200): string {
    const cleaned = content.replace(/\s+/g, ' ').trim();
    return cleaned.length > maxLength
        ? `${cleaned.substring(0, maxLength)}...`
        : cleaned;
}

export {
    displayResults
}