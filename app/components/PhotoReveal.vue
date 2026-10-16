<script setup lang="ts">
const props = defineProps<{
  photoId: string
  previewDataUrl?: string | null
  token?: string | null
  alt?: string
  /** Quando true, já começa revelada. */
  startRevealed?: boolean
}>()

const revealed = ref(props.startRevealed ?? false)
const loaded = ref(false)
const src = computed(() => usePhotoUrl(props.photoId, props.token))
</script>

<template>
  <figure class="reveal">
    <div v-if="!revealed" class="veiled">
      <div
        class="veil-bg"
        :style="previewDataUrl ? { backgroundImage: `url(${previewDataUrl})` } : undefined"
      />
      <div class="veil-content">
        <span class="veil-icon" aria-hidden="true">✦</span>
        <p class="veil-text">
          A imagem está guardada atrás desta história.<br />
          <span class="muted small">Veja quando sentir vontade.</span>
        </p>
        <button class="btn" type="button" @click="revealed = true">Revelar imagem</button>
      </div>
    </div>

    <div v-else class="photo">
      <img
        v-if="src"
        :src="src"
        :alt="alt || 'Foto da memória'"
        :class="{ loaded }"
        loading="lazy"
        @load="loaded = true"
      />
    </div>

    <figcaption v-if="alt" class="caption muted small">{{ alt }}</figcaption>
  </figure>
</template>

<style scoped>
.reveal {
  margin: 0;
}
.veiled {
  position: relative;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius);
  overflow: hidden;
  min-height: 220px;
  display: grid;
  place-items: center;
  background: var(--surface);
}
.veil-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(26px) saturate(0.6) brightness(0.5);
  transform: scale(1.15);
  opacity: 0.55;
}
.veil-content {
  position: relative;
  text-align: center;
  padding: 1.5rem;
}
.veil-icon {
  font-size: 1.5rem;
  color: var(--accent);
}
.veil-text {
  font-family: var(--serif);
  margin: 0.6rem 0 1rem;
  color: var(--text-soft);
}
.photo {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
}
.photo img {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.photo img.loaded {
  opacity: 1;
}
.caption {
  margin-top: 0.5rem;
  text-align: center;
}
</style>
