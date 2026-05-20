import { faker } from "@faker-js/faker";
import { Neo4jService } from "../src/services/neo4jService.ts";
import courses from "./courses.json" with { type: "json" };

function generateTestData() {
    const students = Array.from({ length: 20 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    }));

    const salesRecords = students.flatMap(student => {
        return Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => ({
            studentId: student.id,
            courseId: faker.helpers.arrayElement(courses).name,
            status: faker.helpers.arrayElement(["paid", "refunded"]),
            paymentMethod: faker.helpers.arrayElement(["pix", "credit_card"]),
            paymentDate: faker.date.past().toISOString(),
            amount: faker.number.float({ min: 0, max: 2000, fractionDigits: 2 }),
        }));
    });

    const progressRecords = salesRecords
        .filter(sale => sale.status === "paid")
        .map(sale => ({
            studentId: sale.studentId,
            courseId: sale.courseId,
            progress: faker.number.int({ min: 0, max: 100 }),
        }));

    return { students, salesRecords, progressRecords };
}

export async function seedDatabase() {
    const neo4jService = new Neo4jService();
    console.log("🧹 Clearing database...");
    await neo4jService.clearDatabase();
    console.log("✅ Database cleared!");

    const { students, salesRecords, progressRecords } = generateTestData();

    // Insert courses using raw Cypher (simpler for UNWIND operations)
    await neo4jService.query(
        `UNWIND $batch AS row
        MERGE (c:Course {name: row.name})
        ON CREATE SET c.url = row.url`,
        { batch: courses }
    );
    console.log("✅ Courses Inserted!");

    // Insert students
    await neo4jService.query(
        `UNWIND $batch AS row
        MERGE (s:Student {id: row.id})
        ON CREATE SET s.name = row.name, s.email = row.email, s.phone = row.phone`,
        { batch: students }
    );
    console.log("✅ Students Inserted!");

    // Insert sales relationships
    await neo4jService.query(
        `UNWIND $batch AS row
        MATCH (s:Student {id: row.studentId}), (c:Course {name: row.courseId})
        MERGE (s)-[p:PURCHASED]->(c)
        ON CREATE SET p.status = row.status, p.paymentMethod = row.paymentMethod, p.paymentDate = row.paymentDate, p.amount = row.amount
        ON MATCH SET p.status = row.status, p.paymentMethod = row.paymentMethod, p.paymentDate = row.paymentDate, p.amount = row.amount`,
        { batch: salesRecords }
    );
    console.log("✅ Sales Inserted!");

    // Insert progress relationships
    await neo4jService.query(
        `UNWIND $batch AS row
        MATCH (s:Student {id: row.studentId})-[:PURCHASED {status: "paid"}]->(c:Course {name: row.courseId})
        MERGE (s)-[p:PROGRESS]->(c)
        ON CREATE SET p.progress = row.progress
        ON MATCH SET p.progress = row.progress`,
        { batch: progressRecords }
    );
    console.log("✅ Progress Inserted!");

    // Reset session to avoid transaction conflicts
    await neo4jService.close();
}
