<script setup lang="ts">
const { locale } = useI18n()

useHead({
  htmlAttrs: computed(() => ({ lang: locale.value })),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
