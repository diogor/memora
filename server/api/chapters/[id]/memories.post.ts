import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { chapterMemories, chapters, memories } from '../../../db/schema'

const bodySchema = z.object({ memoryId: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const { memoryId } = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.id, id), eq(chapters.userId, userId)))
    .limit(1)
  notFoundIfMissing(chapter)

  const [memory] = await db
    .select({ id: memories.id })
    .from(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .limit(1)
  if (!memory) throw createError({ statusCode: 400, statusMessage: 'Memória inválida' })

  const rows = await db
    .select({ max: sql<number>`coalesce(max(${chapterMemories.sortOrder}), -1)` })
    .from(chapterMemories)
    .where(eq(chapterMemories.chapterId, id))

  await db
    .insert(chapterMemories)
    .values({ chapterId: id, memoryId, sortOrder: Number(rows[0]?.max ?? -1) + 1 })
    .onConflictDoNothing()

  return { ok: true }
})
