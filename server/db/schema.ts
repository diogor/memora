import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
}

/** Sentidos evocados por uma memória (cheiros, sons, sabores...). */
export type Senses = {
  smell?: string
  sound?: string
  taste?: string
  touch?: string
  sight?: string
}

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
})

export const photos = sqliteTable(
  'photos',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storageKey: text('storage_key').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull().default(0),
    width: integer('width'),
    height: integer('height'),
    /** Miniatura desfocada (data URL) usada como placeholder antes do "revelar". */
    previewDataUrl: text('preview_data_url'),
    originalName: text('original_name'),
    ...timestamps,
  },
  (t) => [index('photos_user_idx').on(t.userId)],
)

export const themes = sqliteTable(
  'themes',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    color: text('color').notNull().default('#8b7cf6'),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('themes_user_idx').on(t.userId)],
)

export const memories = sqliteTable(
  'memories',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    photoId: text('photo_id').references(() => photos.id, { onDelete: 'set null' }),
    themeId: text('theme_id').references(() => themes.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    /** A história — narrativa em texto/markdown. É o elemento central. */
    story: text('story').notNull().default(''),
    feelings: text('feelings', { mode: 'json' }).$type<string[]>().$defaultFn(() => []).notNull(),
    senses: text('senses', { mode: 'json' }).$type<Senses>().$defaultFn(() => ({})).notNull(),
    /** Quando o momento aconteceu (data livre). */
    happenedAt: text('happened_at'),
    place: text('place'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    ...timestamps,
  },
  (t) => [index('memories_user_idx').on(t.userId), index('memories_theme_idx').on(t.themeId)],
)

export const chapters = sqliteTable(
  'chapters',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    themeId: text('theme_id').references(() => themes.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    coverPhotoId: text('cover_photo_id').references(() => photos.id, { onDelete: 'set null' }),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    ...timestamps,
  },
  (t) => [index('chapters_user_idx').on(t.userId)],
)

export const chapterMemories = sqliteTable(
  'chapter_memories',
  {
    chapterId: text('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    memoryId: text('memory_id')
      .notNull()
      .references(() => memories.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.chapterId, t.memoryId] })],
)

export const shares = sqliteTable(
  'shares',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    scopeType: text('scope_type', { enum: ['memory', 'chapter'] }).notNull(),
    scopeId: text('scope_id').notNull(),
    label: text('label'),
    passwordHash: text('password_hash'),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
    viewCount: integer('view_count').notNull().default(0),
    lastViewedAt: integer('last_viewed_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (t) => [index('shares_owner_idx').on(t.ownerId)],
)

export type User = typeof users.$inferSelect
export type Photo = typeof photos.$inferSelect
export type Theme = typeof themes.$inferSelect
export type Memory = typeof memories.$inferSelect
export type Chapter = typeof chapters.$inferSelect
export type Share = typeof shares.$inferSelect
