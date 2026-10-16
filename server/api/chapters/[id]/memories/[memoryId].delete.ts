import { and, eq } from 'drizzle-orm'
import { chapterMemories, chapters } from '../../../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const memoryId = getRouterParam(event, 'memoryId')!
  const db = useDb()

  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.id, id), eq(chapters.userId, userId)))
    .limit(1)
  notFoundIfMissing(chapter)

  await db
    .delete(chapterMemories)
    .where(and(eq(chapterMemories.chapterId, id), eq(chapterMemories.memoryId, memoryId)))

  return { ok: true }
})
