// Aplica as migrations do Drizzle no banco configurado (Turso/libSQL).
// Uso: pnpm db:migrate
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const rawUrl =
  process.env.NUXT_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:.data/memora.db'
const url = rawUrl.startsWith('file:')
  ? (() => {
      const abs = resolve(process.cwd(), rawUrl.slice('file:'.length))
      mkdirSync(dirname(abs), { recursive: true })
      return `file:${abs}`
    })()
  : rawUrl
const authToken =
  process.env.NUXT_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined

const client = createClient({ url, authToken })
const db = drizzle(client)

await migrate(db, { migrationsFolder: './server/db/migrations' })
console.log(`✓ Migrations aplicadas em ${url}`)
client.close()
