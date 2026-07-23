import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import pg from "pg"

const { Client } = pg
const migrationsDirectory = path.resolve(process.cwd(), "migrations")
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations.")
}
const client = new Client({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10_000,
})

try {
  await client.connect()
  await client.query("BEGIN")
  await client.query("SELECT pg_advisory_xact_lock($1)", [225_225])
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_app_migrations" (
      "name" text PRIMARY KEY,
      "checksum" text NOT NULL,
      "applied_at" timestamptz NOT NULL DEFAULT now()
    )
  `)

  const migrationNames = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort()

  for (const name of migrationNames) {
    const sql = await readFile(path.join(migrationsDirectory, name), "utf8")
    const checksum = createHash("sha256").update(sql).digest("hex")
    const result = await client.query(
      'SELECT "checksum" FROM "_app_migrations" WHERE "name" = $1',
      [name],
    )

    if (result.rowCount === 1) {
      if (result.rows[0].checksum !== checksum) {
        throw new Error(`Migration already applied but modified: ${name}`)
      }
      continue
    }

    await client.query(sql)
    await client.query(
      'INSERT INTO "_app_migrations" ("name", "checksum") VALUES ($1, $2)',
      [name, checksum],
    )
    console.log(`Applied migration ${name}`)
  }

  await client.query("COMMIT")
  console.log("Database migrations are up to date.")
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined)
  console.error("Database migration failed.")
  throw error
} finally {
  await client.end().catch(() => undefined)
}
