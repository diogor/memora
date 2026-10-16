<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const { data, error } = await useFetch(`/api/memories/${id}`)
if (error.value || !data.value?.memory) {
  throw createError({ statusCode: 404, statusMessage: 'Memória não encontrada' })
}

const memory = computed(() => data.value!.memory)

useHead(() => ({ title: `Editar · ${memory.value?.title ?? ''}` }))

const initial = computed(() => ({
  title: memory.value!.title,
  story: memory.value!.story,
  photoId: memory.value!.photoId,
  previewDataUrl: data.value!.photo?.previewDataUrl ?? null,
  themeId: memory.value!.themeId,
  happenedAt: memory.value!.happenedAt,
  place: memory.value!.place,
  feelings: memory.value!.feelings ?? [],
  senses: memory.value!.senses ?? {},
}))

async function onSaved(memoryId: string) {
  await navigateTo(`/memorias/${memoryId}`)
}
</script>

<template>
  <div class="container container-narrow">
    <h1>Editar memória</h1>
    <MemoryForm :memory-id="id" :initial="initial" @saved="onSaved" />
  </div>
</template>
