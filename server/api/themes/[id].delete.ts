import { and, eq } from 'drizzle-orm'
import { themes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [existing] = await db
    .select({ id: themes.id })
    .from(themes)
    .where(and(eq(themes.id, id), eq(themes.userId, userId)))
    .limit(1)
  notFoundIfMissing(existing)

  // As memórias ligadas a este tema ficam com themeId = null (onDelete: set null).
  await db.delete(themes).where(and(eq(themes.id, id), eq(themes.userId, userId)))

  return { ok: true }
})
