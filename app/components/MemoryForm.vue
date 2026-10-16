<script setup lang="ts">
interface InitialMemory {
  title: string
  story: string
  photoId: string | null
  previewDataUrl: string | null
  themeId: string | null
  happenedAt: string | null
  place: string | null
  feelings: string[]
  senses: {
    sight?: string
    smell?: string
    sound?: string
    taste?: string
    touch?: string
  }
}

const props = defineProps<{ memoryId?: string; initial?: Partial<InitialMemory> }>()
const emit = defineEmits<{ (e: 'saved', id: string): void }>()

const { data: themeData } = await useFetch('/api/themes')

const title = ref(props.initial?.title ?? '')
const story = ref(props.initial?.story ?? '')
const themeId = ref(props.initial?.themeId ?? '')
const happenedAt = ref(props.initial?.happenedAt ?? '')
const place = ref(props.initial?.place ?? '')
const feelings = ref<string[]>([...(props.initial?.feelings ?? [])])
const feelingInput = ref('')
const senses = reactive({
  sight: props.initial?.senses?.sight ?? '',
  smell: props.initial?.senses?.smell ?? '',
  sound: props.initial?.senses?.sound ?? '',
  taste: props.initial?.senses?.taste ?? '',
  touch: props.initial?.senses?.touch ?? '',
})

const photoId = ref<string | null>(props.initial?.photoId ?? null)
const previewDataUrl = ref<string | null>(props.initial?.previewDataUrl ?? null)

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const saving = ref(false)
const error = ref('')

function addFeeling() {
  const value = feelingInput.value.trim()
  if (value && !feelings.value.includes(value)) feelings.value.push(value)
  feelingInput.value = ''
}

function removeFeeling(value: string) {
  feelings.value = feelings.value.filter((f) => f !== value)
}

function clearPhoto() {
  photoId.value = null
  previewDataUrl.value = null
}

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Escolha um arquivo de imagem.'
    return
  }
  error.value = ''
  uploading.value = true
  try {
    const meta = await buildPhotoMeta(file)
    const result = await uploadPhoto(file, meta)
    photoId.value = result.id
    previewDataUrl.value = result.previewDataUrl
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Não foi possível enviar a foto.'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function submit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = 'Dê um título à memória.'
    return
  }
  saving.value = true
  try {
    const payload = {
      title: title.value.trim(),
      story: story.value,
      themeId: themeId.value || null,
      photoId: photoId.value || null,
      happenedAt: happenedAt.value.trim() || null,
      place: place.value.trim() || null,
      feelings: feelings.value,
      senses: Object.fromEntries(
        Object.entries(senses).filter(([, v]) => v && v.trim()),
      ),
    }

    if (props.memoryId) {
      await $fetch(`/api/memories/${props.memoryId}`, { method: 'PATCH', body: payload })
      emit('saved', props.memoryId)
    } else {
      const { id } = await $fetch<{ id: string }>('/api/memories', { method: 'POST', body: payload })
      emit('saved', id)
    }
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Não foi possível salvar.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="stack" @submit.prevent="submit">
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <section class="panel">
      <label class="label">Foto (o gatilho)</label>
      <div class="photo-row">
        <div class="photo-slot" :class="{ empty: !previewDataUrl }">
          <img v-if="previewDataUrl" :src="previewDataUrl" alt="Prévia da foto" />
          <span v-else class="muted small">Sem foto ainda</span>
        </div>
        <div class="stack" style="flex: 1">
          <p class="small muted" style="margin: 0">
            A imagem fica escondida atrás da história. É opcional — algumas memórias vivem só em
            palavras.
          </p>
          <div class="row">
            <button type="button" class="btn btn-sm" :disabled="uploading" @click="fileInput?.click()">
              {{ uploading ? 'Enviando…' : photoId ? 'Trocar foto' : 'Escolher foto' }}
            </button>
            <button
              v-if="photoId"
              type="button"
              class="btn btn-sm btn-ghost"
              @click="clearPhoto"
            >
              Remover
            </button>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            hidden
            @change="onFile"
          />
        </div>
      </div>
    </section>

    <section class="panel stack">
      <div class="field">
        <label class="label" for="title">Título</label>
        <input id="title" v-model="title" class="input" type="text" maxlength="200" required />
      </div>

      <div class="field" style="margin: 0">
        <label class="label" for="story">A história</label>
        <textarea
          id="story"
          v-model="story"
          class="textarea textarea-story"
          placeholder="Escreva com calma. O que sentiu, o que ouviu, o que o ar tinha naquele instante…"
        />
      </div>
    </section>

    <section class="panel stack">
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
        <div class="field" style="margin: 0">
          <label class="label" for="theme">Tema</label>
          <select id="theme" v-model="themeId" class="select">
            <option value="">Sem tema</option>
            <option v-for="t in themeData?.themes || []" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>

        <div class="field" style="margin: 0">
          <label class="label" for="when">Quando aconteceu</label>
          <input
            id="when"
            v-model="happenedAt"
            class="input"
            type="text"
            placeholder="Ex.: Verão de 1998"
          />
        </div>

        <div class="field" style="margin: 0">
          <label class="label" for="place">Onde</label>
          <input
            id="place"
            v-model="place"
            class="input"
            type="text"
            placeholder="Ex.: Casa da avó, no quintal"
          />
        </div>
      </div>

      <div class="field" style="margin: 0">
        <label class="label" for="feeling">Sentimentos</label>
        <div class="row">
          <input
            id="feeling"
            v-model="feelingInput"
            class="input"
            style="flex: 1; min-width: 180px"
            type="text"
            placeholder="Ex.: saudade — pressione Enter"
            @keydown.enter.prevent="addFeeling"
          />
          <button type="button" class="btn btn-sm" @click="addFeeling">Adicionar</button>
        </div>
        <div v-if="feelings.length" class="chips">
          <span v-for="f in feelings" :key="f" class="chip chip-accent">
            {{ f }}
            <button type="button" class="chip-x" @click="removeFeeling(f)">×</button>
          </span>
        </div>
      </div>
    </section>

    <details class="panel">
      <summary>Sentidos e sensações (opcional)</summary>
      <div class="stack" style="margin-top: 1rem">
        <div class="field" style="margin: 0">
          <label class="label" for="smell">Cheiro</label>
          <input id="smell" v-model="senses.smell" class="input" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label class="label" for="sound">Som</label>
          <input id="sound" v-model="senses.sound" class="input" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label class="label" for="taste">Sabor</label>
          <input id="taste" v-model="senses.taste" class="input" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label class="label" for="touch">Toque</label>
          <input id="touch" v-model="senses.touch" class="input" type="text" />
        </div>
        <div class="field" style="margin: 0">
          <label class="label" for="sight">O que a vista guardou</label>
          <input id="sight" v-model="senses.sight" class="input" type="text" />
        </div>
      </div>
    </details>

    <div class="row between">
      <NuxtLink to="/memorias" class="btn btn-ghost">Cancelar</NuxtLink>
      <button class="btn btn-primary" :disabled="saving || uploading">
        {{ saving ? 'Guardando…' : memoryId ? 'Salvar mudanças' : 'Guardar memória' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.photo-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.photo-slot {
  width: 160px;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface-2);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.photo-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
}
.chip-x {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}
summary {
  cursor: pointer;
  color: var(--text-soft);
}
</style>
