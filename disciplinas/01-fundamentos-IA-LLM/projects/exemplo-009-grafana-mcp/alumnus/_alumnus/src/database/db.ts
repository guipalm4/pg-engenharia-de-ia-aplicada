import knex, { type Knex } from 'knex'
import type { Student } from '../types.ts'

/**
 * Create a database if it doesn't exist
 * @param dbUrl - Full database URL including the database name
 */
export async function createDatabase (dbUrl: string): Promise<void> {
  const url = new URL(dbUrl)
  const databaseName = url.pathname.slice(1) // Remove leading slash

  // Connect to postgres database to create the target database
  const adminUrl = new URL(dbUrl)
  adminUrl.pathname = '/postgres'

  const adminDb = knex({
    client: 'pg',
    connection: adminUrl.toString()
  })

  try {
    // Check if database exists
    const result = await adminDb.raw(
      'SELECT 1 FROM pg_database WHERE datname = ?',
      [databaseName]
    )

    if (result.rows.length === 0) {
      // Create database if it doesn't exist
      await adminDb.raw(`CREATE DATABASE ${databaseName}`)
    }
  } finally {
    await adminDb.destroy()
  }
}

export async function connect (dbUrl: string): Promise<Knex> {
  // Ensure database exists before connecting
  await createDatabase(dbUrl)

  const db = knex({
    client: 'pg',
    connection: dbUrl,
    searchPath: ['knex', 'public']
  })

  await db.raw('SELECT 1 as result')
  return db
}

/**
 * Drop a database
 * @param databaseUrl - Full database URL including the database name
 */
export async function dropDatabase (databaseUrl: string): Promise<void> {
  const url = new URL(databaseUrl)
  const databaseName = url.pathname.slice(1) // Remove leading slash

  // Connect to postgres database to drop the target database
  const adminUrl = new URL(databaseUrl)
  adminUrl.pathname = '/postgres'

  const adminDb = knex({
    client: 'pg',
    connection: adminUrl.toString()
  })

  try {
    // Terminate all connections to the database before dropping
    await adminDb.raw(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = ?
        AND pid <> pg_backend_pid()
    `, [databaseName])

    // Drop the database
    await adminDb.raw(`DROP DATABASE IF EXISTS ${databaseName}`)
  } finally {
    await adminDb.destroy()
  }
}

export async function seedDb (db: Knex): Promise<void> {
  await db.schema.dropTableIfExists('courses')
  await db.schema.dropTableIfExists('students')

  await db.schema.createTable('courses', function (table) {
    table.increments('id').primary()
    table.string('name')
  })

  await db.schema
    .createTable('students', (table) => {
      table.increments('id').primary()
      table.string('name')
      table.integer('courseId')

      table
        .foreign('courseId')
        .references('courses.id')
        .withKeyName('fk_fkey_courses')
    })

  await db('courses')
    .insert([
      { name: 'Node.js Streams' },
      { name: 'JavaScript Expert' }

    ])
  await db('students')
    .insert([
      { name: 'Nightcrawler', courseId: 1 }

    ])

  await Promise.all(
    [
      db('courses').select('*'),
      db('students').select('*')
    ]
  )
}

export async function selectAllBadQuery (db: Knex): Promise<Student[]> {
  const students = await db('students').select('*') as Student[]
  for (const student of students) {
    const course = await db('courses').select('*').where({ id: student.courseId }).first()
    student.course = course.name
    delete student.courseId
  }

  return students
}

export async function selectAllGoodQuery (db: Knex): Promise<Student[]> {
  const students = await db('students')
    .select('students.id', 'students.name', 'courses.name as course')
    .innerJoin('courses', 'courses.id', 'students.courseId') as Student[]

  return students
}
