import { and, eq } from 'drizzle-orm'
import { memories, photos } from '../../db/schema'
import { memoryCreateSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readValidatedBody(event, memoryCreateSchema.parse)
  const db = useDb()

  // Se uma foto foi informada, confirme que ela pertence ao usuário.
  if (body.photoId) {
    const [photo] = await db
      .select({ id: photos.id })
      .from(photos)
      .where(and(eq(photos.id, body.photoId), eq(photos.userId, userId)))
      .limit(1)
    if (!photo) {
      throw createError({ statusCode: 400, statusMessage: 'Foto inválida' })
    }
  }

  const id = newId()
  const now = new Date()
  await db.insert(memories).values({
    id,
    userId,
    title: body.title,
    story: body.story ?? '',
    themeId: body.themeId ?? null,
    photoId: body.photoId ?? null,
    happenedAt: body.happenedAt ?? null,
    place: body.place ?? null,
    feelings: body.feelings ?? [],
    senses: body.senses ?? {},
    createdAt: now,
    updatedAt: now,
  })

  return { id }
})
