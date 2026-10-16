import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { chapterMemories, chapters } from '../../../db/schema'

const bodySchema = z.object({ memoryIds: z.array(z.string()).max(500) })

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const { memoryIds } = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.id, id), eq(chapters.userId, userId)))
    .limit(1)
  notFoundIfMissing(chapter)

  await Promise.all(
    memoryIds.map((memoryId, index) =>
      db
        .update(chapterMemories)
        .set({ sortOrder: index })
        .where(and(eq(chapterMemories.chapterId, id), eq(chapterMemories.memoryId, memoryId))),
    ),
  )

  return { ok: true }
})
