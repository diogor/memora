<script setup lang="ts">
useHead({ title: 'Criar conta' })

const { fetch: fetchSession } = useUserSession()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value },
    })
    await fetchSession()
    await navigateTo('/memorias')
  } catch (e: any) {
    const issues = e?.data?.data
    error.value = e?.data?.statusMessage || issues?.[0]?.message || 'Não foi possível criar a conta.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container container-narrow auth">
    <h1>Criar conta</h1>
    <p class="muted small">
      Suas memórias ficam privadas. Ninguém vê nada além de você e de quem você escolher.
    </p>

    <form class="panel" @submit.prevent="submit">
      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="field">
        <label class="label" for="name">Nome</label>
        <input id="name" v-model="name" class="input" type="text" autocomplete="name" required />
      </div>

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
          autocomplete="new-password"
          minlength="8"
          required
        />
        <p class="small muted" style="margin: 0.4rem 0 0">Ao menos 8 caracteres.</p>
      </div>

      <button class="btn btn-primary" style="width: 100%" :disabled="loading">
        {{ loading ? 'Criando…' : 'Criar conta' }}
      </button>
    </form>

    <p class="small muted center">
      Já tem conta? <NuxtLink to="/login">Entrar</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.auth {
  max-width: 420px;
  padding-top: 3rem;
}
</style>
