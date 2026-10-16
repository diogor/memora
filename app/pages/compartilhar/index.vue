<script setup lang="ts">
useHead({ title: 'Compartilhados' })

const { data, refresh } = await useFetch('/api/shares')
const shares = computed(() => data.value?.shares ?? [])

const origin = ref('')
onMounted(() => (origin.value = window.location.origin))

const copiedId = ref('')

function linkFor(token: string) {
  return `${origin.value}/m/${token}`
}

function statusOf(s: any) {
  if (s.revokedAt) return { text: 'Revogado', cls: 'muted' }
  if (s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()) return { text: 'Expirado', cls: 'muted' }
  if (s.hasPassword) return { text: 'Ativo · com senha', cls: 'accent' }
  return { text: 'Ativo', cls: 'accent' }
}

async function copy(token: string) {
  await navigator.clipboard.writeText(linkFor(token))
  copiedId.value = token
  setTimeout(() => (copiedId.value = ''), 1600)
}

async function revoke(id: string) {
  if (!confirm('Revogar este link? Quem o tiver deixará de ver a memória.')) return
  await $fetch(`/api/shares/${id}`, { method: 'DELETE' })
  await refresh()
}

function fmt(date: string | null) {
  return date ? new Date(date).toLocaleDateString('pt-BR') : '—'
}
</script>

<template>
  <div class="container container-narrow">
    <h1>Compartilhados</h1>
    <p class="muted small" style="margin-top: 0">
      Links secretos que você criou. Sem curtidas, sem público — apenas quem você escolher.
    </p>

    <ul v-if="shares.length" class="list">
      <li v-for="s in shares" :key="s.id" class="card share-row">
        <div class="grow">
          <div class="row" style="gap: 0.5rem">
            <strong>{{ s.scopeTitle }}</strong>
            <span class="chip">{{ s.scopeType === 'memory' ? 'memória' : 'capítulo' }}</span>
            <span class="chip" :class="{ 'chip-accent': statusOf(s).cls === 'accent' }">
              {{ statusOf(s).text }}
            </span>
          </div>
          <div class="small muted" style="margin-top: 0.35rem">
            Criado em {{ fmt(s.createdAt) }} · {{ s.viewCount }}
            {{ s.viewCount === 1 ? 'visualização' : 'visualizações' }}
            <span v-if="s.expiresAt"> · expira em {{ fmt(s.expiresAt) }}</span>
          </div>
        </div>
        <div class="row">
          <button class="btn btn-sm btn-ghost" type="button" :disabled="!!s.revokedAt" @click="copy(s.token)">
            {{ copiedId === s.token ? 'Copiado!' : 'Copiar link' }}
          </button>
          <button
            class="btn btn-sm btn-danger"
            type="button"
            :disabled="!!s.revokedAt"
            @click="revoke(s.id)"
          >
            Revogar
          </button>
        </div>
      </li>
    </ul>

    <p v-else class="muted center" style="padding: 2rem 0">
      Você ainda não compartilhou nada. Abra uma memória ou capítulo e use “Compartilhar”.
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
.share-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.grow {
  flex: 1;
  min-width: 200px;
}
</style>
