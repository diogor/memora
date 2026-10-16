// Tipagem da sessão do nuxt-auth-utils, visível para o app, o servidor e o
// código compartilhado (ver os `include` em .nuxt/tsconfig.*.json).
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
  }
}

export {}
