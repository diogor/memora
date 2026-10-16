<script setup lang="ts">
useHead({ title: 'Temas' })

const { data, refresh } = await useFetch('/api/themes')
const themes = computed(() => data.value?.themes ?? [])

const name = ref('')
const color = ref('#8b7cf6')
const description = ref('')
const saving = ref(false)
const error = ref('')

const editingId = ref<string | null>(null)
const editName = ref('')
const editColor = ref('#8b7cf6')
const editDescription = ref('')

async function create() {
  if (!name.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/themes', {
      method: 'POST',
      body: { name: name.value.trim(), color: color.value, description: description.value.trim() || null },
    })
    name.value = ''
    description.value = ''
    color.value = '#8b7cf6'
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Não foi possível criar o tema.'
  } finally {
    saving.value = false
  }
}

function startEdit(theme: any) {
  editingId.value = theme.id
  editName.value = theme.name
  editColor.value = theme.color
  editDescription.value = theme.description ?? ''
}

async function saveEdit(id: string) {
  await $fetch(`/api/themes/${id}`, {
    method: 'PATCH',
    body: {
      name: editName.value.trim(),
      color: editColor.value,
      description: editDescription.value.trim() || null,
    },
  })
  editingId.value = null
  await refresh()
}

async function remove(id: string) {
  if (!confirm('Excluir este tema? As memórias continuam existindo, apenas sem tema.')) return
  await $fetch(`/api/themes/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div class="container container-narrow">
    <h1>Temas</h1>
    <p class="muted small" style="margin-top: 0">
      Grandes assuntos da sua vida: infância, viagens, pessoas, lugares. Servem para agrupar memórias.
    </p>

    <form class="panel stack" @submit.prevent="create">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div class="row" style="gap: 0.75rem; align-items: flex-end">
        <div class="field" style="flex: 1; margin: 0">
          <label class="label" for="tname">Nome do tema</label>
          <input id="tname" v-model="name" class="input" type="text" placeholder="Ex.: Infância" required />
        </div>
        <div class="field" style="margin: 0">
          <label class="label" for="tcolor">Cor</label>
          <input id="tcolor" v-model="color" class="input color" type="color" />
        </div>
        <button class="btn btn-primary" :disabled="saving">{{ saving ? '…' : 'Criar' }}</button>
      </div>
      <div class="field" style="margin: 0">
        <label class="label" for="tdesc">Descrição (opcional)</label>
        <input id="tdesc" v-model="description" class="input" type="text" />
      </div>
    </form>

    <ul class="list">
      <li v-for="t in themes" :key="t.id" class="card theme-row">
        <template v-if="editingId !== t.id">
          <span class="dot" :style="{ background: t.color }" />
          <div class="grow">
            <strong>{{ t.name }}</strong>
            <div class="small muted">
              {{ t.memoryCount }} {{ t.memoryCount === 1 ? 'memória' : 'memórias' }}
              <span v-if="t.description"> · {{ t.description }}</span>
            </div>
          </div>
          <div class="row">
            <NuxtLink :to="`/memorias?themeId=${t.id}`" class="btn btn-sm btn-ghost">Ver</NuxtLink>
            <button class="btn btn-sm btn-ghost" type="button" @click="startEdit(t)">Editar</button>
            <button class="btn btn-sm btn-danger" type="button" @click="remove(t.id)">Excluir</button>
          </div>
        </template>

        <template v-else>
          <input v-model="editColor" class="input color" type="color" />
          <input v-model="editName" class="input" type="text" style="flex: 1" />
          <input v-model="editDescription" class="input" type="text" placeholder="Descrição" style="flex: 1" />
          <div class="row">
            <button class="btn btn-sm btn-primary" type="button" @click="saveEdit(t.id)">Salvar</button>
            <button class="btn btn-sm btn-ghost" type="button" @click="editingId = null">Cancelar</button>
          </div>
        </template>
      </li>
    </ul>

    <p v-if="!themes.length" class="muted center" style="padding: 2rem 0">
      Nenhum tema ainda. Crie o primeiro acima.
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
.theme-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.grow {
  flex: 1;
  min-width: 140px;
}
.color {
  width: 48px;
  padding: 0.2rem;
  height: 40px;
}
</style>
