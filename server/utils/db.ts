import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as schema from '../db/schema'

let _client: Client | undefined
let _db: LibSQLDatabase<typeof schema> | undefined

/** Converte URLs `file:` relativas em caminhos absolutos e garante o diretório. */
function normalizeUrl(raw: string): string {
  if (!raw.startsWith('file:')) return raw
  const path = resolve(process.cwd(), raw.slice('file:'.length))
  mkdirSync(dirname(path), { recursive: true })
  return `file:${path}`
}

/**
 * Cliente Drizzle (singleton) apontando para o Turso/libSQL.
 * Em desenvolvimento usa um arquivo local (`.data/memora.db`).
 */
export function useDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    const url = normalizeUrl(
      process.env.NUXT_TURSO_DATABASE_URL ||
        process.env.TURSO_DATABASE_URL ||
        'file:.data/memora.db',
    )
    const authToken =
      process.env.NUXT_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined
    _client = createClient({ url, authToken })
    _db = drizzle(_client, { schema })
  }
  return _db
}

export { schema }
