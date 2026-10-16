import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../db/schema'

const bodySchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const normalized = email.trim().toLowerCase()

  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1)

  // Mensagem genérica para não revelar se o e-mail existe.
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    throw createError({ statusCode: 401, statusMessage: 'E-mail ou senha incorretos' })
  }

  await setUserSession(event, {
    user: { id: user.id, name: user.name, email: user.email },
  })

  return { ok: true }
})
