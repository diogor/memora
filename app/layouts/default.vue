<script setup lang="ts">
const { loggedIn, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="shell">
    <header v-if="loggedIn" class="topbar">
      <div class="container row between">
        <NuxtLink to="/memorias" class="brand">Memora</NuxtLink>

        <nav class="nav">
          <NuxtLink to="/memorias">Memórias</NuxtLink>
          <NuxtLink to="/temas">Temas</NuxtLink>
          <NuxtLink to="/capitulos">Capítulos</NuxtLink>
          <NuxtLink to="/compartilhar">Compartilhados</NuxtLink>
        </nav>

        <div class="row">
          <NuxtLink to="/memorias/nova" class="btn btn-primary btn-sm">Nova memória</NuxtLink>
          <button class="btn btn-ghost btn-sm" type="button" @click="logout">Sair</button>
        </div>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(22, 19, 15, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 0;
}
.brand {
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.02em;
}
.brand:hover {
  text-decoration: none;
  color: var(--accent-soft);
}
.nav {
  display: flex;
  gap: 1.25rem;
}
.nav a {
  color: var(--text-soft);
  font-size: 0.92rem;
}
.nav a:hover {
  color: var(--text);
  text-decoration: none;
}
.nav a.router-link-active {
  color: var(--accent-soft);
}
.main {
  flex: 1;
  padding: 2.5rem 0 4rem;
}
@media (max-width: 760px) {
  .nav {
    display: none;
  }
}
</style>
