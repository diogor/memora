import { randomBytes, randomUUID } from 'node:crypto'

// Hashing de senha: usamos `hashPassword` / `verifyPassword` do nuxt-auth-utils
// (scrypt), já auto-importados no servidor. Atenção: lá a ordem é
// `verifyPassword(hash, senhaEmTextoPlano)`.

/** Identificador único para registros. */
export function newId(): string {
  return randomUUID()
}

/** Token opaco de alta entropia para links de compartilhamento. */
export function newToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url')
}
