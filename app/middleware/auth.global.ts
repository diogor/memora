// Rotas públicas: entrada, cadastro e páginas de compartilhamento (/m/:token).
const PUBLIC_PATHS = new Set(['/', '/login', '/registrar'])

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const isPublic = PUBLIC_PATHS.has(to.path) || to.path.startsWith('/m/')

  if (!isPublic && !loggedIn.value) {
    return navigateTo('/login')
  }

  if (isPublic && loggedIn.value && (to.path === '/login' || to.path === '/registrar')) {
    return navigateTo('/memorias')
  }
})
