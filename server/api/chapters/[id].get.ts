import { and, asc, eq } from 'drizzle-orm'
import { chapterMemories, chapters, memories, photos, themes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [chapter] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, id), eq(chapters.userId, userId)))
    .limit(1)
  const found = notFoundIfMissing(chapter)

  const items = await db
    .select({
      linkId: chapterMemories.memoryId,
      sortOrder: chapterMemories.sortOrder,
      id: memories.id,
      title: memories.title,
      story: memories.story,
      happenedAt: memories.happenedAt,
      place: memories.place,
      feelings: memories.feelings,
      themeId: memories.themeId,
      themeName: themes.name,
      photoId: memories.photoId,
      previewDataUrl: photos.previewDataUrl,
      width: photos.width,
      height: photos.height,
    })
    .from(chapterMemories)
    .innerJoin(memories, eq(chapterMemories.memoryId, memories.id))
    .leftJoin(themes, eq(memories.themeId, themes.id))
    .leftJoin(photos, eq(memories.photoId, photos.id))
    .where(eq(chapterMemories.chapterId, id))
    .orderBy(asc(chapterMemories.sortOrder), asc(chapterMemories.memoryId))

  return { chapter: found, memories: items }
})
