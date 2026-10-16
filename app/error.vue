<script setup lang="ts">
const props = defineProps<{ error: any }>()

const isNotFound = computed(() => props.error?.statusCode === 404)

function goHome() {
  clearError({ redirect: '/memorias' })
}
</script>

<template>
  <div class="container container-narrow err">
    <p class="eyebrow">Memora</p>
    <h1>{{ isNotFound ? 'Não encontramos esta página' : 'Algo deu errado' }}</h1>
    <p class="muted">{{ error?.statusMessage || error?.message || 'Tente novamente.' }}</p>
    <button class="btn btn-primary" type="button" @click="goHome">Voltar ao início</button>
  </div>
</template>

<style scoped>
.err {
  max-width: 480px;
  padding-top: 5rem;
  text-align: center;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: var(--accent);
}
</style>
