import { eq } from 'drizzle-orm'
import { photos } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const db = useDb()

  const [photo] = await db.select().from(photos).where(eq(photos.id, id)).limit(1)
  if (!photo) throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })

  let allowed = false

  // 1) Dono autenticado.
  const session = await getUserSession(event)
  if (session?.user?.id && session.user.id === photo.userId) {
    allowed = true
  } else {
    // 2) Link de compartilhamento válido (com cookie de senha, se houver).
    const token = getQuery(event).token
    if (token) {
      const share = await getValidShareByToken(String(token))
      if (share && canAccessShare(event, share) && (await shareAllowsPhoto(share, photo.id))) {
        allowed = true
      }
    }
  }

  if (!allowed) throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })

  const obj = await getObject(photo.storageKey, photo.mime)
  setHeader(event, 'Content-Type', obj.contentType)
  setHeader(event, 'Cache-Control', 'private, max-age=3600')
  return Buffer.from(obj.data)
})
