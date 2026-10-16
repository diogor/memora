import { createHmac } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import {
  chapterMemories,
  chapters,
  memories,
  shares,
  type Share,
} from '../db/schema'

function sessionSecret(): string {
  return process.env.NUXT_SESSION_PASSWORD || 'memora-dev-secret-change-me'
}

/** Busca um compartilhamento válido (não revogado e não expirado). */
export async function getValidShareByToken(token: string): Promise<Share | null> {
  if (!token) return null
  const db = useDb()
  const [share] = await db.select().from(shares).where(eq(shares.token, token)).limit(1)
  if (!share) return null
  if (share.revokedAt) return null
  if (share.expiresAt && share.expiresAt.getTime() < Date.now()) return null
  return share
}

function cookieName(token: string): string {
  return `memora_share_${token.slice(0, 12)}`
}

function cookieValue(token: string): string {
  return createHmac('sha256', sessionSecret()).update(token).digest('base64url')
}

export function markShareUnlocked(event: H3Event, token: string): void {
  setCookie(event, cookieName(token), cookieValue(token), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
  })
}

/** Um compartilhamento sem senha está sempre acessível; com senha, exige o cookie de unlock. */
export function canAccessShare(event: H3Event, share: Share): boolean {
  if (!share.passwordHash) return true
  return getCookie(event, cookieName(share.token)) === cookieValue(share.token)
}

/** Verifica se uma foto faz parte do escopo compartilhado. */
export async function shareAllowsPhoto(share: Share, photoId: string): Promise<boolean> {
  const db = useDb()

  if (share.scopeType === 'memory') {
    const [memory] = await db
      .select({ photoId: memories.photoId })
      .from(memories)
      .where(eq(memories.id, share.scopeId))
      .limit(1)
    return memory?.photoId === photoId
  }

  const [chapter] = await db
    .select({ coverPhotoId: chapters.coverPhotoId })
    .from(chapters)
    .where(eq(chapters.id, share.scopeId))
    .limit(1)
  if (!chapter) return false
  if (chapter.coverPhotoId === photoId) return true

  const [linked] = await db
    .select({ photoId: memories.photoId })
    .from(chapterMemories)
    .innerJoin(memories, eq(chapterMemories.memoryId, memories.id))
    .where(and(eq(chapterMemories.chapterId, share.scopeId), eq(memories.photoId, photoId)))
    .limit(1)
  return Boolean(linked)
}
