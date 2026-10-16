import { themes } from '../../db/schema'
import { themeSchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readValidatedBody(event, themeSchema.parse)
  const db = useDb()

  const id = newId()
  const name = body.name.trim()
  await db.insert(themes).values({
    id,
    userId,
    name,
    slug: slugify(name),
    color: body.color,
    description: body.description ?? null,
    sortOrder: body.sortOrder ?? 0,
  })

  return { id }
})
