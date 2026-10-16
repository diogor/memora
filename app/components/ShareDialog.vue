<script setup lang="ts">
const props = defineProps<{
  scopeType: 'memory' | 'chapter'
  scopeId: string
  label?: string
}>()

const open = ref(false)
const creating = ref(false)
const error = ref('')
const createdUrl = ref('')
const password = ref('')
const expires = ref('')
const copied = ref(false)
const includePassword = ref(false)

async function create() {
  error.value = ''
  createdUrl.value = ''
  creating.value = true
  try {
    const { token } = await $fetch<{ token: string }>('/api/shares', {
      method: 'POST',
      body: {
        scopeType: props.scopeType,
        scopeId: props.scopeId,
        label: props.label ?? null,
        password: includePassword.value && password.value ? password.value : null,
        expiresInDays: expires.value ? Number(expires.value) : null,
      },
    })
    const origin = import.meta.client ? window.location.origin : ''
    createdUrl.value = `${origin}/m/${token}`
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Não foi possível criar o link.'
  } finally {
    creating.value = false
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(createdUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    copied.value = false
  }
}

function close() {
  open.value = false
  createdUrl.value = ''
  password.value = ''
  expires.value = ''
  includePassword.value = false
  error.value = ''
}
</script>

<template>
  <button class="btn btn-sm" type="button" @click="open = true">Compartilhar</button>

  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="close">
      <div class="dialog panel">
        <div class="row between">
          <h3 style="margin: 0">Compartilhar</h3>
          <button class="btn btn-sm btn-ghost" type="button" @click="close">Fechar</button>
        </div>

        <p class="small muted">
          Gere um link secreto. Só quem tiver o link (e a senha, se definir) verá esta
          {{ scopeType === 'memory' ? 'memória' : 'coleção' }}. Você pode revogar quando quiser.
        </p>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <template v-if="!createdUrl">
          <div class="field">
            <label class="label" for="exp">Validade</label>
            <select id="exp" v-model="expires" class="select">
              <option value="">Sem validade</option>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="365">1 ano</option>
            </select>
          </div>

          <div class="field">
            <label class="row" style="gap: 0.5rem; cursor: pointer">
              <input v-model="includePassword" type="checkbox" />
              <span class="label" style="margin: 0">Proteger com senha</span>
            </label>
            <input
              v-if="includePassword"
              v-model="password"
              class="input"
              type="text"
              placeholder="Senha combinada com a pessoa"
              style="margin-top: 0.5rem"
            />
          </div>

          <button class="btn btn-primary" type="button" :disabled="creating" @click="create">
            {{ creating ? 'Gerando…' : 'Gerar link' }}
          </button>
        </template>

        <template v-else>
          <label class="label">Link pronto</label>
          <div class="link-row">
            <input class="input" :value="createdUrl" readonly @focus="($event.target as HTMLInputElement).select()" />
            <button class="btn btn-primary btn-sm" type="button" @click="copy">
              {{ copied ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
          <p class="small muted">
            Guarde este link — ele não será mostrado novamente. Você pode gerenciá-lo em
            <NuxtLink to="/compartilhar" @click="close">Compartilhados</NuxtLink>.
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}
.dialog {
  width: 100%;
  max-width: 460px;
  background: var(--surface);
}
.link-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.link-row .input {
  flex: 1;
}
</style>
