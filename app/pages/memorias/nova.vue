<script setup lang="ts">
useHead({ title: 'Nova memória' })

async function onSaved(id: string) {
  await navigateTo(`/memorias/${id}`)
}
</script>

<template>
  <div class="container container-narrow">
    <h1>Nova memória</h1>
    <p class="muted small" style="margin-top: 0">
      Comece pela história. A foto, se houver, fica escondida atrás dela.
    </p>
    <MemoryForm @saved="onSaved" />
  </div>
</template>
