<script setup lang="ts">
const props = defineProps<{ message: string; onRetry?: () => void }>()
</script>

<template>
  <div class="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
    <span class="text-2xl shrink-0">⚠️</span>
    <div class="flex-1">
      <p class="text-red-700 font-medium text-sm">{{ message }}</p>
      <button v-if="onRetry" @click="onRetry" class="mt-2 text-xs text-red-600 underline hover:no-underline">Încearcă din nou</button>
    </div>
  </div>
</template>
