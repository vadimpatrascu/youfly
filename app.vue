<template>
  <!-- Skip to content link for accessibility -->
  <a href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg">
    Salt la conținut principal
  </a>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
