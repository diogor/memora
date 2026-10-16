import { asc, count, eq } from 'drizzle-orm'
import { chapterMemories, chapters, themes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()

  const rows = await db
    .select({
      id: chapters.id,
      title: chapters.title,
      description: chapters.description,
      themeId: chapters.themeId,
      themeName: themes.name,
      themeColor: themes.color,
      coverPhotoId: chapters.coverPhotoId,
      sortOrder: chapters.sortOrder,
      createdAt: chapters.createdAt,
      memoryCount: count(chapterMemories.memoryId),
    })
    .from(chapters)
    .leftJoin(themes, eq(chapters.themeId, themes.id))
    .leftJoin(chapterMemories, eq(chapterMemories.chapterId, chapters.id))
    .where(eq(chapters.userId, userId))
    .groupBy(chapters.id)
    .orderBy(asc(chapters.sortOrder), asc(chapters.createdAt))

  return { chapters: rows }
})
