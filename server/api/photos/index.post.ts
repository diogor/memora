import { readMultipartFormData } from 'h3'
import { photos } from '../../db/schema'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const MAX_BYTES = 15 * 1024 * 1024
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })
  }

  const text = (name: string) => parts.find((p) => p.name === name)?.data?.toString('utf8')
  const file = parts.find((p) => p.name === 'file' && p.filename)
  if (!file?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo ausente' })
  }

  const mime = file.type || 'application/octet-stream'
  if (!ALLOWED.has(mime)) {
    throw createError({ statusCode: 415, statusMessage: 'Formato de imagem não suportado' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Imagem maior que 15 MB' })
  }

  const id = newId()
  const storageKey = `u/${userId}/${id}.${EXT[mime] ?? 'bin'}`
  await putObject(storageKey, file.data, mime)

  const toInt = (v?: string) => {
    const n = v ? Number.parseInt(v, 10) : Number.NaN
    return Number.isFinite(n) ? n : null
  }
  let preview = text('previewDataUrl')?.trim() || null
  if (preview && (!preview.startsWith('data:image/') || preview.length > 30_000)) {
    preview = null
  }

  const db = useDb()
  await db.insert(photos).values({
    id,
    userId,
    storageKey,
    mime,
    size: file.data.length,
    width: toInt(text('width')),
    height: toInt(text('height')),
    previewDataUrl: preview,
    originalName: file.filename ?? null,
  })

  return {
    id,
    width: toInt(text('width')),
    height: toInt(text('height')),
    previewDataUrl: preview,
  }
})
