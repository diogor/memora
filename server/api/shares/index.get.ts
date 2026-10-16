import { and, desc, eq } from 'drizzle-orm'
import { chapters, memories, shares } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const db = useDb()

  const rows = await db
    .select({
      id: shares.id,
      token: shares.token,
      scopeType: shares.scopeType,
      scopeId: shares.scopeId,
      label: shares.label,
      hasPassword: shares.passwordHash,
      expiresAt: shares.expiresAt,
      revokedAt: shares.revokedAt,
      viewCount: shares.viewCount,
      lastViewedAt: shares.lastViewedAt,
      createdAt: shares.createdAt,
      memoryTitle: memories.title,
      chapterTitle: chapters.title,
    })
    .from(shares)
    .leftJoin(memories, and(eq(shares.scopeType, 'memory'), eq(shares.scopeId, memories.id)))
    .leftJoin(chapters, and(eq(shares.scopeType, 'chapter'), eq(shares.scopeId, chapters.id)))
    .where(eq(shares.ownerId, userId))
    .orderBy(desc(shares.createdAt))

  return {
    shares: rows.map((r) => ({
      id: r.id,
      token: r.token,
      scopeType: r.scopeType,
      scopeId: r.scopeId,
      label: r.label,
      hasPassword: Boolean(r.hasPassword),
      expiresAt: r.expiresAt,
      revokedAt: r.revokedAt,
      viewCount: r.viewCount,
      lastViewedAt: r.lastViewedAt,
      createdAt: r.createdAt,
      scopeTitle: r.memoryTitle || r.chapterTitle || '(removido)',
    })),
  }
})
