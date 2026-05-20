import { seedDatabase } from "./seedHelpers.ts";

async function insertData() {
    await seedDatabase();
}

await insertData();
