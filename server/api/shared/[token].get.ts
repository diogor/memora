import { asc, eq, sql } from 'drizzle-orm'
import {
  chapterMemories,
  chapters,
  memories,
  photos,
  shares,
  themes,
} from '../../db/schema'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')!
  const share = await getValidShareByToken(token)
  if (!share) {
    throw createError({ statusCode: 404, statusMessage: 'Link inválido, expirado ou revogado' })
  }

  if (!canAccessShare(event, share)) {
    return { protected: true, label: share.label, scopeType: share.scopeType }
  }

  const db = useDb()
  await db
    .update(shares)
    .set({ viewCount: sql`${shares.viewCount} + 1`, lastViewedAt: new Date() })
    .where(eq(shares.id, share.id))

  if (share.scopeType === 'memory') {
    const [row] = await db
      .select({
        id: memories.id,
        title: memories.title,
        story: memories.story,
        happenedAt: memories.happenedAt,
        place: memories.place,
        feelings: memories.feelings,
        senses: memories.senses,
        createdAt: memories.createdAt,
        updatedAt: memories.updatedAt,
        photoId: memories.photoId,
        previewDataUrl: photos.previewDataUrl,
        width: photos.width,
        height: photos.height,
        themeName: themes.name,
        themeColor: themes.color,
      })
      .from(memories)
      .leftJoin(photos, eq(memories.photoId, photos.id))
      .leftJoin(themes, eq(memories.themeId, themes.id))
      .where(eq(memories.id, share.scopeId))
      .limit(1)

    if (!row) throw createError({ statusCode: 404, statusMessage: 'Memória indisponível' })
    return { protected: false, scopeType: 'memory', memory: row, token }
  }

  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, share.scopeId))
    .limit(1)
  if (!chapter) throw createError({ statusCode: 404, statusMessage: 'Capítulo indisponível' })

  const items = await db
    .select({
      id: memories.id,
      title: memories.title,
      story: memories.story,
      happenedAt: memories.happenedAt,
      place: memories.place,
      feelings: memories.feelings,
      photoId: memories.photoId,
      previewDataUrl: photos.previewDataUrl,
      width: photos.width,
      height: photos.height,
      themeName: themes.name,
    })
    .from(chapterMemories)
    .innerJoin(memories, eq(chapterMemories.memoryId, memories.id))
    .leftJoin(photos, eq(memories.photoId, photos.id))
    .leftJoin(themes, eq(memories.themeId, themes.id))
    .where(eq(chapterMemories.chapterId, chapter.id))
    .orderBy(asc(chapterMemories.sortOrder))

  return {
    protected: false,
    scopeType: 'chapter',
    chapter: { id: chapter.id, title: chapter.title, description: chapter.description },
    memories: items,
    token,
  }
})
