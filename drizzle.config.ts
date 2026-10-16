import { defineConfig } from 'drizzle-kit'

const url = process.env.TURSO_DATABASE_URL || 'file:.data/memora.db'
const authToken = process.env.TURSO_AUTH_TOKEN || undefined

export default defineConfig({
  dialect: 'turso',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: {
    url,
    authToken,
  },
  verbose: true,
  strict: true,
})
