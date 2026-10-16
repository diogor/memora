import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../db/schema'

const bodySchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(80),
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'A senha precisa de ao menos 8 caracteres').max(200),
})

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const normalized = email.trim().toLowerCase()

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1)

  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Este e-mail já está em uso' })
  }

  const id = newId()
  await db.insert(users).values({
    id,
    name: name.trim(),
    email: normalized,
    passwordHash: await hashPassword(password),
  })

  await setUserSession(event, {
    user: { id, name: name.trim(), email: normalized },
  })

  return { ok: true }
})
