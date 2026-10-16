<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const token = route.params.token as string

const { data, error, refresh } = await useFetch(`/api/shared/${token}`)

// A resposta é uma união (protegido / memória / capítulo); normalizamos para leitura.
const content = computed(() => data.value as any)

const invalid = computed(() => error.value || !data.value)
const protectedShare = computed(() => content.value?.protected === true)

useHead({ title: 'Uma memória compartilhada · Memora' })

// --- desbloqueio por senha ---
const password = ref('')
const unlocking = ref(false)
const unlockError = ref('')

async function unlock() {
  unlockError.value = ''
  unlocking.value = true
  try {
    await $fetch(`/api/shared/${token}/unlock`, { method: 'POST', body: { password: password.value } })
    await refresh()
  } catch (e: any) {
    unlockError.value = e?.data?.statusMessage || 'Senha incorreta.'
  } finally {
    unlocking.value = false
  }
}
</script>

<template>
  <div class="shared">
    <header class="top">
      <span class="brand">Memora</span>
      <span class="muted small">Uma história compartilhada com você</span>
    </header>

    <div v-if="invalid" class="container container-narrow center-block">
      <h1>Link indisponível</h1>
      <p class="muted">
        Este link foi revogado, expirou ou não existe mais. Peça um novo a quem compartilhou.
      </p>
    </div>

    <div v-else-if="protectedShare" class="container container-narrow center-block">
      <h1>Conteúdo protegido</h1>
      <p class="muted">Digite a senha combinada para ler esta história.</p>
      <form class="panel" @submit.prevent="unlock">
        <div v-if="unlockError" class="alert alert-error">{{ unlockError }}</div>
        <div class="field">
          <label class="label" for="pw">Senha</label>
          <input id="pw" v-model="password" class="input" type="password" required />
        </div>
        <button class="btn btn-primary" style="width: 100%" :disabled="unlocking">
          {{ unlocking ? 'Verificando…' : 'Ver história' }}
        </button>
      </form>
    </div>

    <template v-else-if="content">
      <!-- Memória única -->
      <article v-if="content.scopeType === 'memory'" class="container container-narrow reader">
        <div class="row" style="gap: 0.5rem; margin-bottom: 0.75rem">
          <span v-if="content.memory.themeName" class="chip">{{ content.memory.themeName }}</span>
          <span v-if="content.memory.happenedAt" class="chip">{{ content.memory.happenedAt }}</span>
          <span v-if="content.memory.place" class="chip">📍 {{ content.memory.place }}</span>
        </div>
        <h1 class="title">{{ content.memory.title }}</h1>
        <div class="story">{{ content.memory.story }}</div>

        <div v-if="content.memory.feelings?.length" class="chips">
          <span v-for="f in content.memory.feelings" :key="f" class="chip chip-accent">{{ f }}</span>
        </div>

        <section v-if="content.memory.photoId" class="photo-section">
          <PhotoReveal
            :photo-id="content.memory.photoId"
            :preview-data-url="content.memory.previewDataUrl"
            :token="token"
            :alt="content.memory.title"
          />
        </section>
      </article>

      <!-- Capítulo / coleção -->
      <article v-else class="container container-narrow reader">
        <h1 class="title">{{ content.chapter.title }}</h1>
        <p v-if="content.chapter.description" class="soft lead">{{ content.chapter.description }}</p>

        <section v-for="(m, i) in content.memories" :key="m.id" class="entry">
          <h2 class="entry-title">
            <span class="ord">{{ Number(i) + 1 }}.</span> {{ m.title }}
          </h2>
          <div class="small muted meta">
            <span v-if="m.happenedAt">{{ m.happenedAt }}</span>
            <span v-if="m.place">· {{ m.place }}</span>
          </div>
          <div class="story">{{ m.story }}</div>
          <div v-if="m.feelings?.length" class="chips">
            <span v-for="f in m.feelings" :key="f" class="chip chip-accent">{{ f }}</span>
          </div>
          <PhotoReveal
            v-if="m.photoId"
            class="photo-section"
            :photo-id="m.photoId"
            :preview-data-url="m.previewDataUrl"
            :token="token"
            :alt="m.title"
          />
        </section>
      </article>
    </template>

    <footer class="foot small muted">
      Guardado com <strong>Memora</strong> — histórias que permanecem.
    </footer>
  </div>
</template>

<style scoped>
.shared {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  gap: 1rem;
  align-items: baseline;
  padding: 1.5rem 20px;
  border-bottom: 1px solid var(--border);
}
.brand {
  font-family: var(--serif);
  font-size: 1.2rem;
  color: var(--accent-soft);
}
.center-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 20px;
  max-width: 520px;
}
.reader {
  flex: 1;
  padding: 2.5rem 20px 4rem;
}
.title {
  font-size: clamp(1.9rem, 5vw, 2.8rem);
  margin-bottom: 1.5rem;
}
.lead {
  font-family: var(--serif);
  font-size: 1.15rem;
  margin-bottom: 2rem;
}
.story {
  font-family: var(--serif);
  font-size: 1.2rem;
  line-height: 1.85;
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
}
.chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.photo-section {
  margin-bottom: 2.5rem;
}
.entry {
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}
.entry:last-child {
  border-bottom: 0;
}
.entry-title {
  font-size: 1.5rem;
}
.ord {
  color: var(--accent);
}
.meta {
  margin: -0.6rem 0 1rem;
  display: flex;
  gap: 0.4rem;
}
.foot {
  text-align: center;
  padding: 2rem 20px;
  border-top: 1px solid var(--border);
}
</style>
