<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const { data, error } = await useFetch(`/api/memories/${id}`)
if (error.value || !data.value?.memory) {
  throw createError({ statusCode: 404, statusMessage: 'Memória não encontrada' })
}

const memory = computed(() => data.value!.memory)
const photo = computed(() => data.value!.photo)
const theme = computed(() => data.value!.theme)
const chaptersOf = computed(() => data.value!.chapters ?? [])

useHead(() => ({ title: memory.value?.title || 'Memória' }))

const { data: chapterData } = await useFetch('/api/chapters')
const selectedChapter = ref('')
const adding = ref(false)
const actionError = ref('')

const sensingEntries = computed(() =>
  Object.entries(memory.value?.senses || {}).filter(([, v]) => v),
)

const SENSE_LABELS: Record<string, string> = {
  smell: 'Cheiro',
  sound: 'Som',
  taste: 'Sabor',
  touch: 'Toque',
  sight: 'A vista',
}

async function addToChapter() {
  if (!selectedChapter.value) return
  adding.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/chapters/${selectedChapter.value}/memories`, {
      method: 'POST',
      body: { memoryId: id },
    })
    await refreshNuxtData(`/api/memories/${id}`)
    selectedChapter.value = ''
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage || 'Não foi possível adicionar.'
  } finally {
    adding.value = false
  }
}

async function remove() {
  if (!confirm('Excluir esta memória e sua foto? Isso não pode ser desfeito.')) return
  await $fetch(`/api/memories/${id}`, { method: 'DELETE' })
  await navigateTo('/memorias')
}
</script>

<template>
  <div class="container container-narrow">
    <NuxtLink to="/memorias" class="small muted back">← Todas as memórias</NuxtLink>

    <header class="head">
      <div class="row" style="gap: 0.5rem; margin-bottom: 0.6rem">
        <span v-if="theme?.name" class="chip" :style="{ borderColor: theme.color }">
          {{ theme.name }}
        </span>
        <span v-if="memory.happenedAt" class="chip">{{ memory.happenedAt }}</span>
        <span v-if="memory.place" class="chip">📍 {{ memory.place }}</span>
      </div>

      <h1 class="title">{{ memory.title }}</h1>
    </header>

    <div v-if="actionError" class="alert alert-error">{{ actionError }}</div>

    <article class="story">{{ memory.story || 'História ainda em branco.' }}</article>

    <div v-if="memory.feelings?.length" class="chips">
      <span v-for="f in memory.feelings" :key="f" class="chip chip-accent">{{ f }}</span>
    </div>

    <section v-if="sensingEntries.length" class="senses card">
      <h3 class="senses-title">Sensações guardadas</h3>
      <dl>
        <template v-for="[key, value] in sensingEntries" :key="key">
          <dt>{{ SENSE_LABELS[key] || key }}</dt>
          <dd>{{ value }}</dd>
        </template>
      </dl>
    </section>

    <section v-if="photo" class="photo-section">
      <p class="reveal-hint muted small">A imagem que acompanha esta história:</p>
      <PhotoReveal
        :photo-id="photo.id"
        :preview-data-url="photo.previewDataUrl"
        :alt="memory.title"
      />
    </section>

    <section v-if="chaptersOf.length" class="small muted chaps">
      Em capítulos:
      <NuxtLink v-for="c in chaptersOf" :key="c.id" :to="`/capitulos/${c.id}`" class="chip">
        {{ c.title }}
      </NuxtLink>
    </section>

    <hr class="divider" />

    <div class="actions">
      <NuxtLink :to="`/memorias/${id}/editar`" class="btn btn-sm">Editar</NuxtLink>
      <ShareDialog scope-type="memory" :scope-id="id" :label="memory.title" />
      <button class="btn btn-sm btn-danger" type="button" @click="remove">Excluir</button>

      <div class="add-chapter row">
        <select v-model="selectedChapter" class="select" style="max-width: 220px">
          <option value="">Adicionar a capítulo…</option>
          <option v-for="c in chapterData?.chapters || []" :key="c.id" :value="c.id">
            {{ c.title }}
          </option>
        </select>
        <button
          class="btn btn-sm"
          type="button"
          :disabled="!selectedChapter || adding"
          @click="addToChapter"
        >
          {{ adding ? '…' : 'Adicionar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 1.5rem;
}
.head {
  margin-bottom: 1.5rem;
}
.title {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  margin: 0;
}
.story {
  font-family: var(--serif);
  font-size: 1.2rem;
  line-height: 1.85;
  color: var(--text);
  white-space: pre-wrap;
  margin-bottom: 1.75rem;
}
.chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.senses {
  margin-bottom: 1.75rem;
}
.senses-title {
  font-size: 1rem;
  color: var(--accent-soft);
  margin-bottom: 0.75rem;
}
.senses dl {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.4rem 1rem;
  margin: 0;
}
.senses dt {
  color: var(--muted);
  font-size: 0.85rem;
}
.senses dd {
  margin: 0;
  color: var(--text-soft);
}
.photo-section {
  margin-bottom: 2rem;
}
.reveal-hint {
  margin-bottom: 0.5rem;
}
.chaps {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.divider {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 1.5rem 0;
}
.actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}
.add-chapter {
  margin-left: auto;
}
</style>
