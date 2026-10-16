<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const { data, error, refresh } = await useFetch(`/api/chapters/${id}`)
if (error.value || !data.value?.chapter) {
  throw createError({ statusCode: 404, statusMessage: 'Capítulo não encontrado' })
}

useHead(() => ({ title: data.value?.chapter?.title || 'Capítulo' }))

const chapter = computed(() => data.value!.chapter)
const memories = ref<any[]>([...(data.value!.memories ?? [])])
watch(data, (d) => (memories.value = [...(d?.memories ?? [])]))

const { data: allData } = await useFetch('/api/memories')
const availableToAdd = computed(() =>
  (allData.value?.memories ?? []).filter((m) => !memories.value.some((x) => x.id === m.id)),
)

const editing = ref(false)
const editTitle = ref(chapter.value.title)
const editDescription = ref(chapter.value.description ?? '')

async function saveMeta() {
  await $fetch(`/api/chapters/${id}`, {
    method: 'PATCH',
    body: { title: editTitle.value.trim(), description: editDescription.value.trim() || null },
  })
  editing.value = false
  await refresh()
}

const addId = ref('')
const busy = ref(false)
const actionError = ref('')

async function addMemory() {
  if (!addId.value) return
  busy.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/chapters/${id}/memories`, { method: 'POST', body: { memoryId: addId.value } })
    addId.value = ''
    await refresh()
  } catch (e: any) {
    actionError.value = e?.data?.statusMessage || 'Não foi possível adicionar.'
  } finally {
    busy.value = false
  }
}

async function removeMemory(memoryId: string) {
  await $fetch(`/api/chapters/${id}/memories/${memoryId}`, { method: 'DELETE' })
  await refresh()
}

async function move(index: number, dir: -1 | 1) {
  const target = index + dir
  if (target < 0 || target >= memories.value.length) return
  const arr = memories.value.slice()
  ;[arr[index], arr[target]] = [arr[target], arr[index]]
  memories.value = arr
  await $fetch(`/api/chapters/${id}/reorder`, {
    method: 'POST',
    body: { memoryIds: arr.map((m) => m.id) },
  })
}

function excerpt(text?: string) {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  return t.length > 140 ? `${t.slice(0, 140)}…` : t
}
</script>

<template>
  <div class="container container-narrow">
    <NuxtLink to="/capitulos" class="small muted back">← Capítulos</NuxtLink>

    <header class="head">
      <template v-if="!editing">
        <h1 class="title">{{ chapter.title }}</h1>
        <p v-if="chapter.description" class="soft desc">{{ chapter.description }}</p>
        <button class="btn btn-sm btn-ghost" type="button" @click="editing = true">Editar título</button>
      </template>
      <template v-else>
        <div class="field">
          <label class="label" for="et">Título</label>
          <input id="et" v-model="editTitle" class="input" type="text" />
        </div>
        <div class="field">
          <label class="label" for="ed">Descrição</label>
          <input id="ed" v-model="editDescription" class="input" type="text" />
        </div>
        <div class="row">
          <button class="btn btn-sm btn-primary" type="button" @click="saveMeta">Salvar</button>
          <button class="btn btn-sm btn-ghost" type="button" @click="editing = false">Cancelar</button>
        </div>
      </template>
    </header>

    <div class="row toolbar">
      <ShareDialog scope-type="chapter" :scope-id="id" :label="chapter.title" />
      <NuxtLink :to="`/livro/${id}`" class="btn btn-sm">Ver como livro</NuxtLink>
      <span class="small muted">{{ memories.length }} {{ memories.length === 1 ? 'memória' : 'memórias' }}</span>
    </div>

    <div v-if="actionError" class="alert alert-error">{{ actionError }}</div>

    <div class="add card row">
      <select v-model="addId" class="select" style="flex: 1">
        <option value="">Adicionar uma memória a este capítulo…</option>
        <option v-for="m in availableToAdd" :key="m.id" :value="m.id">{{ m.title }}</option>
      </select>
      <button class="btn btn-sm btn-primary" type="button" :disabled="!addId || busy" @click="addMemory">
        {{ busy ? '…' : 'Adicionar' }}
      </button>
    </div>

    <ol v-if="memories.length" class="timeline">
      <li v-for="(m, i) in memories" :key="m.id" class="entry card">
        <div class="ord">{{ i + 1 }}</div>
        <div class="entry-body">
          <NuxtLink :to="`/memorias/${m.id}`"><strong>{{ m.title }}</strong></NuxtLink>
          <p v-if="excerpt(m.story)" class="soft small excerpt">{{ excerpt(m.story) }}</p>
          <div class="row small muted meta">
            <span v-if="m.happenedAt">{{ m.happenedAt }}</span>
            <span v-if="m.place">📍 {{ m.place }}</span>
            <span v-if="m.themeName">· {{ m.themeName }}</span>
          </div>
        </div>
        <div class="entry-actions">
          <button class="btn btn-sm btn-ghost" type="button" :disabled="i === 0" @click="move(i, -1)">↑</button>
          <button
            class="btn btn-sm btn-ghost"
            type="button"
            :disabled="i === memories.length - 1"
            @click="move(i, 1)"
          >
            ↓
          </button>
          <button class="btn btn-sm btn-danger" type="button" @click="removeMemory(m.id)">Remover</button>
        </div>
      </li>
    </ol>

    <p v-else class="muted center" style="padding: 2rem 0">
      Este capítulo ainda não tem histórias. Adicione as primeiras acima.
    </p>
  </div>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 1.25rem;
}
.head {
  margin-bottom: 1.25rem;
}
.title {
  margin-bottom: 0.3rem;
}
.desc {
  margin: 0 0 0.75rem;
}
.toolbar {
  margin-bottom: 1.25rem;
  gap: 0.6rem;
}
.add {
  margin-bottom: 1.5rem;
  gap: 0.75rem;
  padding: 1rem;
}
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}
.entry {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.ord {
  font-family: var(--serif);
  font-size: 1.4rem;
  color: var(--accent);
  min-width: 2rem;
}
.entry-body {
  flex: 1;
}
.excerpt {
  margin: 0.3rem 0;
}
.meta {
  gap: 0.75rem;
}
.entry-actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
</style>
