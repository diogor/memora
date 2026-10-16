<script setup lang="ts">
useHead({ title: 'Entrar' })

const { fetch: fetchSession } = useUserSession()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await fetchSession()
    await navigateTo('/memorias')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'Não foi possível entrar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container container-narrow auth">
    <h1>Entrar</h1>
    <p class="muted small">Bem-vindo de volta ao seu arquivo de memórias.</p>

    <form class="panel" @submit.prevent="submit">
      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="field">
        <label class="label" for="email">E-mail</label>
        <input id="email" v-model="email" class="input" type="email" autocomplete="email" required />
      </div>

      <div class="field">
        <label class="label" for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <button class="btn btn-primary" style="width: 100%" :disabled="loading">
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>

    <p class="small muted center">
      Ainda não tem conta? <NuxtLink to="/registrar">Criar agora</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.auth {
  max-width: 420px;
  padding-top: 3rem;
}
</style>
