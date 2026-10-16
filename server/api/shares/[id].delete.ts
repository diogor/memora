import { and, eq } from 'drizzle-orm'
import { shares } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [existing] = await db
    .select({ id: shares.id })
    .from(shares)
    .where(and(eq(shares.id, id), eq(shares.ownerId, userId)))
    .limit(1)
  notFoundIfMissing(existing)

  await db
    .update(shares)
    .set({ revokedAt: new Date() })
    .where(and(eq(shares.id, id), eq(shares.ownerId, userId)))

  return { ok: true }
})
