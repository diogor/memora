<script setup lang="ts">
type MemoryCardItem = {
  id: string
  title: string
  story?: string | null
  previewDataUrl?: string | null
  photoId?: string | null
  themeName?: string | null
  themeColor?: string | null
  happenedAt?: string | null
  place?: string | null
  feelings?: string[] | null
}

const props = defineProps<{ memory: MemoryCardItem }>()

const excerpt = computed(() => {
  const text = (props.memory.story || '').replace(/\s+/g, ' ').trim()
  return text.length > 160 ? `${text.slice(0, 160)}…` : text
})
</script>

<template>
  <NuxtLink :to="`/memorias/${memory.id}`" class="card memory-card">
    <div class="thumb" :class="{ empty: !memory.previewDataUrl }">
      <div
        v-if="memory.previewDataUrl"
        class="thumb-bg"
        :style="{ backgroundImage: `url(${memory.previewDataUrl})` }"
      />
      <span v-else class="thumb-empty" aria-hidden="true">✎</span>
    </div>

    <div class="body">
      <div class="row between top">
        <span
          v-if="memory.themeName"
          class="chip"
          :style="{ borderColor: memory.themeColor || undefined }"
        >
          {{ memory.themeName }}
        </span>
        <span v-else class="chip muted">sem tema</span>
        <time v-if="memory.happenedAt" class="small muted">{{ memory.happenedAt }}</time>
      </div>

      <h3 class="title">{{ memory.title }}</h3>
      <p v-if="excerpt" class="excerpt">{{ excerpt }}</p>
      <p v-else class="excerpt muted">História ainda em branco.</p>

      <div v-if="memory.place" class="small muted place">📍 {{ memory.place }}</div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.memory-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  color: inherit;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.memory-card:hover {
  text-decoration: none;
  transform: translateY(-2px);
  border-color: var(--border-strong);
}
.thumb {
  position: relative;
  aspect-ratio: 3 / 2;
  background: var(--surface-2);
  overflow: hidden;
  display: grid;
  place-items: center;
}
.thumb-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(14px) brightness(0.7) saturate(0.85);
  transform: scale(1.12);
}
.thumb.empty .thumb-empty {
  font-size: 1.5rem;
  color: var(--muted);
}
.body {
  padding: 1rem 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.top {
  gap: 0.5rem;
}
.title {
  font-size: 1.15rem;
  margin: 0.2rem 0 0;
}
.excerpt {
  margin: 0;
  font-family: var(--serif);
  color: var(--text-soft);
  font-size: 0.98rem;
  line-height: 1.6;
}
.place {
  margin-top: 0.2rem;
}
</style>
