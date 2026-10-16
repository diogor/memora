<script setup lang="ts">
useHead({ title: 'Capítulos' })

const { data, refresh } = await useFetch('/api/chapters')
const { data: themeData } = await useFetch('/api/themes')
const chapters = computed(() => data.value?.chapters ?? [])

const title = ref('')
const description = ref('')
const themeId = ref('')
const saving = ref(false)
const error = ref('')

async function create() {
  if (!title.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    const { id } = await $fetch<{ id: string }>('/api/chapters', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        description: description.value.trim() || null,
        themeId: themeId.value || null,
      },
    })
    await navigateTo(`/capitulos/${id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Não foi possível criar o capítulo.'
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Excluir este capítulo? As memórias continuam guardadas.')) return
  await $fetch(`/api/chapters/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="container container-narrow">
    <h1>Capítulos</h1>
    <p class="muted small" style="margin-top: 0">
      Sequências que dão forma ao livro: uma ordem para as histórias, mesmo que venham de temas
      diferentes.
    </p>

    <form class="panel stack" @submit.prevent="create">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div class="field" style="margin: 0">
        <label class="label" for="ctitle">Título do capítulo</label>
        <input id="ctitle" v-model="title" class="input" type="text" placeholder="Ex.: O quintal da avó" required />
      </div>
      <div class="field" style="margin: 0">
        <label class="label" for="cdesc">Descrição (opcional)</label>
        <input id="cdesc" v-model="description" class="input" type="text" />
      </div>
      <div class="row" style="align-items: flex-end">
        <div class="field" style="margin: 0; flex: 1">
          <label class="label" for="ctheme">Tema (opcional)</label>
          <select id="ctheme" v-model="themeId" class="select">
            <option value="">Sem tema</option>
            <option v-for="t in themeData?.themes || []" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <button class="btn btn-primary" :disabled="saving">{{ saving ? '…' : 'Criar capítulo' }}</button>
      </div>
    </form>

    <ul class="list">
      <li v-for="c in chapters" :key="c.id" class="card chapter-row">
        <div class="grow">
          <NuxtLink :to="`/capitulos/${c.id}`"><strong>{{ c.title }}</strong></NuxtLink>
          <div class="small muted">
            {{ c.memoryCount }} {{ c.memoryCount === 1 ? 'memória' : 'memórias' }}
            <span v-if="c.themeName"> · {{ c.themeName }}</span>
          </div>
        </div>
        <div class="row">
          <NuxtLink :to="`/capitulos/${c.id}`" class="btn btn-sm btn-ghost">Abrir</NuxtLink>
          <NuxtLink :to="`/livro/${c.id}`" class="btn btn-sm btn-ghost">Livro</NuxtLink>
          <button class="btn btn-sm btn-danger" type="button" @click="remove(c.id)">Excluir</button>
        </div>
      </li>
    </ul>

    <p v-if="!chapters.length" class="muted center" style="padding: 2rem 0">
      Nenhum capítulo ainda.
    </p>
  </div>
</template>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 0.75rem;
}
.chapter-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.grow {
  flex: 1;
  min-width: 160px;
}
</style>
