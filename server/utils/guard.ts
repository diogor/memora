import type { H3Event } from 'h3'

/** Garante que a requisição vem de um usuário autenticado e devolve seu id. */
export async function requireUserId(event: H3Event): Promise<string> {
  const { user } = await requireUserSession(event)
  return user.id
}

/** Lança 404 se o recurso não pertencer ao usuário (evita vazar existência). */
export function assertOwnership(resourceUserId: string | null | undefined, userId: string): void {
  if (!resourceUserId || resourceUserId !== userId) {
    throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })
  }
}

/**
 * Lança 404 quando a linha não existe. Use quando a consulta já filtra por
 * `userId` — nesse caso, existir significa pertencer ao usuário.
 */
export function notFoundIfMissing<T>(row: T | undefined | null): T {
  if (row === undefined || row === null) {
    throw createError({ statusCode: 404, statusMessage: 'Não encontrado' })
  }
  return row
}
