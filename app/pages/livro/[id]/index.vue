<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const { data, error } = await useFetch(`/api/chapters/${id}`)
if (error.value || !data.value?.chapter) {
  throw createError({ statusCode: 404, statusMessage: 'Capítulo não encontrado' })
}

const chapter = computed(() => data.value!.chapter)
const memories = computed(() => data.value!.memories ?? [])

useHead(() => ({ title: `Livro · ${chapter.value.title}` }))

const coverPhotoId = computed(() => {
  if (chapter.value.coverPhotoId) return chapter.value.coverPhotoId
  return memories.value.find((m) => m.photoId)?.photoId ?? null
})

const year = new Date().getFullYear()

function printBook() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <div class="book">
    <div class="toolbar no-print">
      <NuxtLink :to="`/capitulos/${id}`" class="btn btn-sm btn-ghost">← Voltar ao capítulo</NuxtLink>
      <button class="btn btn-sm btn-primary" type="button" @click="printBook">
        Imprimir / Salvar PDF
      </button>
    </div>

    <!-- Capa -->
    <section class="page cover">
      <img v-if="coverPhotoId" class="cover-img" :src="`/api/photos/${coverPhotoId}/image`" alt="" />
      <div class="cover-text">
        <p class="cover-eyebrow">Memora</p>
        <h1 class="cover-title">{{ chapter.title }}</h1>
        <p v-if="chapter.description" class="cover-desc">{{ chapter.description }}</p>
        <p class="cover-year">{{ year }}</p>
      </div>
    </section>

    <!-- Sumário -->
    <section v-if="memories.length" class="page toc">
      <h2 class="toc-title">Sumário</h2>
      <ol>
        <li v-for="(m, i) in memories" :key="m.id">
          <span class="toc-num">{{ i + 1 }}</span>
          <span>{{ m.title }}</span>
          <span v-if="m.happenedAt" class="toc-when">{{ m.happenedAt }}</span>
        </li>
      </ol>
    </section>

    <!-- Histórias -->
    <section v-for="(m, i) in memories" :key="m.id" class="page entry">
      <p class="entry-num">{{ String(i + 1).padStart(2, '0') }}</p>
      <h2 class="entry-title">{{ m.title }}</h2>
      <p class="entry-meta">
        <span v-if="m.happenedAt">{{ m.happenedAt }}</span>
        <span v-if="m.place"> · {{ m.place }}</span>
      </p>

      <div class="story">{{ m.story }}</div>

      <div v-if="m.feelings?.length" class="feelings">
        <span v-for="f in m.feelings" :key="f">{{ f }}</span>
      </div>

      <figure v-if="m.photoId" class="entry-photo">
        <img :src="`/api/photos/${m.photoId}/image`" :alt="m.title" />
      </figure>
    </section>

    <section v-if="!memories.length" class="page">
      <p class="muted">Este capítulo ainda não tem histórias para virar livro.</p>
    </section>
  </div>
</template>

<style scoped>
.book {
  background: #f7f3ec;
  color: #1b1712;
  min-height: 100vh;
  padding-bottom: 3rem;
}
.toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 20px;
  background: rgba(247, 243, 236, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(27, 23, 18, 0.12);
}
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 3rem 32px;
}

/* Capa */
.cover {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  position: relative;
}
.cover-img {
  width: 100%;
  max-height: 44vh;
  object-fit: cover;
  border-radius: 4px;
  filter: saturate(0.9);
  margin-bottom: 2.5rem;
}
.cover-eyebrow {
  letter-spacing: 0.4em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #8a7a5c;
}
.cover-title {
  font-family: var(--serif);
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  margin: 0.5rem 0;
}
.cover-desc {
  font-family: var(--serif);
  font-style: italic;
  color: #554a3a;
  max-width: 34ch;
  margin: 0.5rem auto;
}
.cover-year {
  margin-top: 2rem;
  color: #8a7a5c;
  letter-spacing: 0.2em;
}

/* Sumário */
.toc {
  break-before: page;
  page-break-before: always;
}
.toc-title {
  font-family: var(--serif);
  font-size: 1.6rem;
  border-bottom: 1px solid rgba(27, 23, 18, 0.15);
  padding-bottom: 0.5rem;
}
.toc ol {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 0.7rem;
}
.toc li {
  display: flex;
  gap: 1rem;
  align-items: baseline;
  font-family: var(--serif);
  font-size: 1.1rem;
}
.toc li > span:nth-child(2) {
  flex: 1;
}
.toc-num {
  color: #b08e4e;
  min-width: 1.5rem;
}
.toc-when {
  color: #8a7a5c;
  font-size: 0.9rem;
}

/* Histórias */
.entry {
  break-before: page;
  page-break-before: always;
}
.entry-num {
  color: #b08e4e;
  font-family: var(--serif);
  font-size: 1rem;
  letter-spacing: 0.2em;
}
.entry-title {
  font-family: var(--serif);
  font-size: 1.9rem;
  margin: 0.2rem 0 0.3rem;
}
.entry-meta {
  color: #8a7a5c;
  font-size: 0.9rem;
  margin-bottom: 1.75rem;
}
.story {
  font-family: var(--serif);
  font-size: 1.15rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
.feelings {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #8a7a5c;
  font-style: italic;
}
.entry-photo {
  margin: 2rem 0 0;
}
.entry-photo img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
