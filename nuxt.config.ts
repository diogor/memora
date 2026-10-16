// Memora — plataforma privada de memórias.
// Nuxt 4 usa por padrão a estrutura com `app/` (front) e `server/` (back) na raiz.
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: ['nuxt-auth-utils', 'nuxt-security'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Memora',
      titleTemplate: '%s · Memora',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
        {
          name: 'description',
          content: 'Um lugar privado para guardar a história por trás de cada foto.',
        },
      ],
    },
  },

  runtimeConfig: {
    // Sessão (nuxt-auth-utils). Obrigatório: NUXT_SESSION_PASSWORD (>= 32 chars).
    session: {
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    },
    // Banco de dados Turso (libSQL). Em dev, usa um arquivo local.
    tursoDatabaseUrl: 'file:.data/memora.db',
    tursoAuthToken: '',
    // Armazenamento de imagens: 'local' (dev) ou 'r2' (Cloudflare R2).
    storageDriver: 'local',
    storageLocalDir: '.data/uploads',
    r2: {
      accountId: '',
      accessKeyId: '',
      secretAccessKey: '',
      bucket: '',
      endpoint: '',
    },
    public: {
      appName: 'Memora',
    },
  },

  security: {
    headers: {
      // Em desenvolvimento o CSP atrapalha o HMR do Vite; em produção usamos os padrões seguros.
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    },
    rateLimiter: {
      tokensPerInterval: 200,
      interval: 60_000,
    },
  },

  // Uploads de fotos podem ser grandes — libera o limite apenas nessa rota.
  routeRules: {
    '/api/photos': {
      security: {
        requestSizeLimiter: {
          maxRequestSizeInBytes: 20 * 1024 * 1024, // 20 MB
          maxUploadFileRequestInBytes: 20 * 1024 * 1024,
        },
      },
    },
  },
})
