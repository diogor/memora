<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="container container-narrow landing">
    <p class="eyebrow">Um lugar só seu</p>
    <h1 class="title">Memora</h1>
    <p class="lead">
      Toda foto guarda uma história que ninguém vê. Aqui, a história vem primeiro —
      sentimentos, cheiros, o instante exato. A imagem fica escondida atrás do texto,
      revelada apenas quando você quiser.
    </p>

    <ul class="values">
      <li>
        <strong>Privado por natureza.</strong> Sem curtidas, sem seguidores, sem comparações.
      </li>
      <li>
        <strong>A narrativa é o centro.</strong> A foto é só o gatilho; o texto é o que permanece.
      </li>
      <li>
        <strong>Organize como um livro.</strong> Reúna memórias em temas e capítulos, prontos
        para imprimir quando você desejar.
      </li>
    </ul>

    <div class="cta">
      <template v-if="loggedIn">
        <NuxtLink to="/memorias" class="btn btn-primary">Ir para as minhas memórias</NuxtLink>
      </template>
      <template v-else>
        <NuxtLink to="/registrar" class="btn btn-primary">Começar a guardar</NuxtLink>
        <NuxtLink to="/login" class="btn">Já tenho uma conta</NuxtLink>
      </template>
    </div>
  </div>
</template>

<style scoped>
.landing {
  padding-top: 3rem;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 0.75rem;
  color: var(--accent);
  margin-bottom: 1rem;
}
.title {
  font-size: clamp(2.6rem, 7vw, 4rem);
  margin-bottom: 0.75rem;
}
.lead {
  font-family: var(--serif);
  font-size: 1.25rem;
  line-height: 1.7;
  color: var(--text-soft);
  margin-bottom: 2rem;
}
.values {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
  margin-bottom: 2.5rem;
}
.values li {
  border-left: 2px solid var(--border-strong);
  padding-left: 1rem;
  color: var(--text-soft);
}
.values strong {
  color: var(--text);
}
.cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
