import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store"
import { config } from "../config.ts"

export type MemoryService = {
    checkpointer: PostgresSaver
    store: PostgresStore
}

export async function createMemoryService(): Promise<MemoryService> {
    const dbUri = config.memory.dbUri
    const store = PostgresStore.fromConnString(dbUri)
    const checkpointer = PostgresSaver.fromConnString(dbUri)

    await store.setup()
    await checkpointer.setup()

    console.log(`✅ Memória configurada: PostgreSQL`);
    return {
        checkpointer,
        store,
    }


}