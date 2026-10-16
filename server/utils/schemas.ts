import { z } from 'zod'

export const sensesSchema = z.object({
  sight: z.string().trim().max(1000).optional(),
  smell: z.string().trim().max(1000).optional(),
  sound: z.string().trim().max(1000).optional(),
  taste: z.string().trim().max(1000).optional(),
  touch: z.string().trim().max(1000).optional(),
})

export const memoryCreateSchema = z.object({
  title: z.string().trim().min(1, 'Dê um título à memória').max(200),
  story: z.string().max(200_000).default(''),
  themeId: z.string().nullish(),
  photoId: z.string().nullish(),
  happenedAt: z.string().trim().max(100).nullish(),
  place: z.string().trim().max(200).nullish(),
  feelings: z.array(z.string().trim().max(60)).max(20).default([]),
  senses: sensesSchema.default({}),
})

export const memoryUpdateSchema = memoryCreateSchema.partial()

export const themeSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(80),
  description: z.string().trim().max(1000).nullish(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida')
    .default('#8b7cf6'),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export const themeUpdateSchema = themeSchema.partial()

export const chapterSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(200),
  description: z.string().trim().max(2000).nullish(),
  themeId: z.string().nullish(),
  coverPhotoId: z.string().nullish(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export const chapterUpdateSchema = chapterSchema.partial()

export const shareCreateSchema = z.object({
  scopeType: z.enum(['memory', 'chapter']),
  scopeId: z.string().min(1),
  label: z.string().trim().max(120).nullish(),
  password: z.string().min(4).max(200).nullish(),
  expiresInDays: z.number().int().min(1).max(3650).nullish(),
})
