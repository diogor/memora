import { z } from 'zod'

const bodySchema = z.object({ password: z.string().min(1, 'Informe a senha') })

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')!
  const share = await getValidShareByToken(token)
  if (!share || !share.passwordHash) {
    throw createError({ statusCode: 404, statusMessage: 'Link inválido' })
  }

  const { password } = await readValidatedBody(event, bodySchema.parse)
  if (!(await verifyPassword(share.passwordHash, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Senha incorreta' })
  }

  markShareUnlocked(event, token)
  return { ok: true }
})
