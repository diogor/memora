import { and, desc, eq, isNotNull, like, or } from 'drizzle-orm'
import { memories, photos, themes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const themeId = typeof query.themeId === 'string' ? query.themeId : ''
  const photoOnly = query.photo === 'true'

  const conditions = [eq(memories.userId, userId)]
  if (themeId) conditions.push(eq(memories.themeId, themeId))
  if (photoOnly) conditions.push(isNotNull(memories.photoId))
  if (q) {
    const term = `%${q}%`
    conditions.push(or(like(memories.title, term), like(memories.story, term))!)
  }

  const rows = await db
    .select({
      id: memories.id,
      title: memories.title,
      story: memories.story,
      themeId: memories.themeId,
      themeName: themes.name,
      themeColor: themes.color,
      photoId: memories.photoId,
      previewDataUrl: photos.previewDataUrl,
      width: photos.width,
      height: photos.height,
      happenedAt: memories.happenedAt,
      place: memories.place,
      feelings: memories.feelings,
      createdAt: memories.createdAt,
      updatedAt: memories.updatedAt,
    })
    .from(memories)
    .leftJoin(themes, eq(memories.themeId, themes.id))
    .leftJoin(photos, eq(memories.photoId, photos.id))
    .where(and(...conditions))
    .orderBy(desc(memories.createdAt))

  return { memories: rows }
})
