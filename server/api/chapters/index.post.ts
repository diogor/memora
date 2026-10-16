import { chapters } from '../../db/schema'
import { chapterSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readValidatedBody(event, chapterSchema.parse)
  const db = useDb()

  const id = newId()
  await db.insert(chapters).values({
    id,
    userId,
    title: body.title.trim(),
    description: body.description ?? null,
    themeId: body.themeId ?? null,
    coverPhotoId: body.coverPhotoId ?? null,
    sortOrder: body.sortOrder ?? 0,
  })

  return { id }
})
