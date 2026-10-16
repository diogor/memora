import { and, eq } from 'drizzle-orm'
import { chapters } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [existing] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.id, id), eq(chapters.userId, userId)))
    .limit(1)
  notFoundIfMissing(existing)

  await db.delete(chapters).where(and(eq(chapters.id, id), eq(chapters.userId, userId)))

  return { ok: true }
})
