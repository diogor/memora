import { asc, count, eq } from 'drizzle-orm'
import { memories, themes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()

  const rows = await db
    .select({
      id: themes.id,
      name: themes.name,
      slug: themes.slug,
      color: themes.color,
      description: themes.description,
      sortOrder: themes.sortOrder,
      createdAt: themes.createdAt,
      memoryCount: count(memories.id),
    })
    .from(themes)
    .leftJoin(memories, eq(memories.themeId, themes.id))
    .where(eq(themes.userId, userId))
    .groupBy(themes.id)
    .orderBy(asc(themes.sortOrder), asc(themes.name))

  return { themes: rows }
})
