import { and, eq } from 'drizzle-orm'
import { chapterMemories, chapters, memories, photos, themes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [row] = await db
    .select({
      memory: memories,
      photo: photos,
      theme: {
        id: themes.id,
        name: themes.name,
        color: themes.color,
      },
    })
    .from(memories)
    .leftJoin(photos, eq(memories.photoId, photos.id))
    .leftJoin(themes, eq(memories.themeId, themes.id))
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .limit(1)

  assertOwnership(row?.memory.userId, userId)

  const inChapters = await db
    .select({ id: chapters.id, title: chapters.title })
    .from(chapterMemories)
    .innerJoin(chapters, eq(chapterMemories.chapterId, chapters.id))
    .where(eq(chapterMemories.memoryId, id))

  return { memory: row!.memory, photo: row!.photo, theme: row!.theme, chapters: inChapters }
})
