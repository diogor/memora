import { and, eq } from 'drizzle-orm'
import { memories, photos } from '../../db/schema'
import { memoryUpdateSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, memoryUpdateSchema.parse)
  const db = useDb()

  const [existing] = await db
    .select({ id: memories.id })
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .limit(1)
  notFoundIfMissing(existing)

  if (body.photoId) {
    const [photo] = await db
      .select({ id: photos.id })
      .from(photos)
      .where(and(eq(photos.id, body.photoId), eq(photos.userId, userId)))
      .limit(1)
    if (!photo) throw createError({ statusCode: 400, statusMessage: 'Foto inválida' })
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() }
  if (body.title !== undefined) patch.title = body.title
  if (body.story !== undefined) patch.story = body.story
  if (body.themeId !== undefined) patch.themeId = body.themeId ?? null
  if (body.photoId !== undefined) patch.photoId = body.photoId ?? null
  if (body.happenedAt !== undefined) patch.happenedAt = body.happenedAt ?? null
  if (body.place !== undefined) patch.place = body.place ?? null
  if (body.feelings !== undefined) patch.feelings = body.feelings
  if (body.senses !== undefined) patch.senses = body.senses

  await db
    .update(memories)
    .set(patch)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))

  return { ok: true }
})
