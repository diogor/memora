import { and, eq } from 'drizzle-orm'
import { memories, photos } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [memory] = await db
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .limit(1)
  assertOwnership(memory?.userId, userId)

  await db.delete(memories).where(eq(memories.id, id))

  // Remove a foto se ela não estiver mais em uso por nenhuma memória.
  if (memory!.photoId) {
    const [other] = await db
      .select({ id: memories.id })
      .from(memories)
      .where(eq(memories.photoId, memory!.photoId))
      .limit(1)

    if (!other) {
      const [photoRow] = await db
        .select()
        .from(photos)
        .where(and(eq(photos.id, memory!.photoId), eq(photos.userId, userId)))
        .limit(1)
      if (photoRow) {
        await deleteObject(photoRow.storageKey)
        await db.delete(photos).where(eq(photos.id, photoRow.id))
      }
    }
  }

  return { ok: true }
})
