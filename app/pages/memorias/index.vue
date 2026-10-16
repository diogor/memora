<script setup lang="ts">
useHead({ title: 'Minhas memórias' })

const q = ref('')
const themeId = ref('')

const { data: themeData } = await useFetch('/api/themes')
const { data, pending } = await useFetch('/api/memories', {
  query: { q, themeId },
})

const memories = computed(() => data.value?.memories ?? [])
</script>

<template>
  <div class="container">
    <div class="row between header">
      <div>
        <h1 style="margin-bottom: 0.15rem">Minhas memórias</h1>
        <p class="muted small" style="margin: 0">
          Cada história guardada aqui é só sua.
        </p>
      </div>
      <NuxtLink to="/memorias/nova" class="btn btn-primary">Nova memória</NuxtLink>
    </div>

    <div class="filters card">
      <input v-model="q" class="input" type="search" placeholder="Buscar por título ou história…" />
      <select v-model="themeId" class="select">
        <option value="">Todos os temas</option>
        <option v-for="t in themeData?.themes || []" :key="t.id" :value="t.id">
          {{ t.name }}
        </option>
      </select>
    </div>

    <div v-if="pending" class="muted center" style="padding: 3rem 0">Carregando…</div>

    <div v-else-if="memories.length" class="grid grid-cards">
      <MemoryCard v-for="m in memories" :key="m.id" :memory="m" />
    </div>

    <div v-else class="empty">
      <p class="muted">
        {{ q || themeId ? 'Nenhuma memória encontrada com esses filtros.' : 'Nada guardado ainda.' }}
      </p>
      <NuxtLink to="/memorias/nova" class="btn btn-primary">Escrever a primeira história</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.header {
  margin-bottom: 1.5rem;
}
.filters {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  padding: 1rem;
}
.empty {
  text-align: center;
  padding: 3rem 0;
  display: grid;
  gap: 1rem;
  justify-items: center;
}
@media (max-width: 620px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
