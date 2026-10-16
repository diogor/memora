import { and, eq } from 'drizzle-orm'
import { themes } from '../../db/schema'
import { themeUpdateSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, themeUpdateSchema.parse)
  const db = useDb()

  const [existing] = await db
    .select({ id: themes.id })
    .from(themes)
    .where(and(eq(themes.id, id), eq(themes.userId, userId)))
    .limit(1)
  notFoundIfMissing(existing)

  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) {
    patch.name = body.name.trim()
    patch.slug = slugify(body.name)
  }
  if (body.color !== undefined) patch.color = body.color
  if (body.description !== undefined) patch.description = body.description ?? null
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder

  if (Object.keys(patch).length) {
    await db.update(themes).set(patch).where(and(eq(themes.id, id), eq(themes.userId, userId)))
  }

  return { ok: true }
})
