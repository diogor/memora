import { and, eq } from 'drizzle-orm'
import { chapters } from '../../db/schema'
import { chapterUpdateSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, chapterUpdateSchema.parse)
  const db = useDb()

  const [existing] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.id, id), eq(chapters.userId, userId)))
    .limit(1)
  notFoundIfMissing(existing)

  const patch: Record<string, unknown> = { updatedAt: new Date() }
  if (body.title !== undefined) patch.title = body.title.trim()
  if (body.description !== undefined) patch.description = body.description ?? null
  if (body.themeId !== undefined) patch.themeId = body.themeId ?? null
  if (body.coverPhotoId !== undefined) patch.coverPhotoId = body.coverPhotoId ?? null
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder

  await db.update(chapters).set(patch).where(and(eq(chapters.id, id), eq(chapters.userId, userId)))

  return { ok: true }
})
