import { and, eq } from 'drizzle-orm'
import { chapters, memories, shares } from '../../db/schema'
import { shareCreateSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readValidatedBody(event, shareCreateSchema.parse)
  const db = useDb()

  // Confirme que o recurso compartilhado pertence ao usuário.
  if (body.scopeType === 'memory') {
    const [memory] = await db
      .select({ id: memories.id })
      .from(memories)
      .where(and(eq(memories.id, body.scopeId), eq(memories.userId, userId)))
      .limit(1)
    if (!memory) throw createError({ statusCode: 404, statusMessage: 'Memória não encontrada' })
  } else {
    const [chapter] = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(and(eq(chapters.id, body.scopeId), eq(chapters.userId, userId)))
      .limit(1)
    if (!chapter) throw createError({ statusCode: 404, statusMessage: 'Capítulo não encontrado' })
  }

  const id = newId()
  const token = newToken()
  await db.insert(shares).values({
    id,
    ownerId: userId,
    token,
    scopeType: body.scopeType,
    scopeId: body.scopeId,
    label: body.label ?? null,
    passwordHash: body.password ? await hashPassword(body.password) : null,
    expiresAt: body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null,
  })

  return { id, token }
})
