<script setup lang="ts">
const props = defineProps<{
  code: string
  width?: number
  /** CSS height class, e.g. 'h-48' */
  heightClass?: string
  /** Disable Ken Burns animation */
  noAnimation?: boolean
}>()

const { getPhotoUrl, getPhotoAlt, getPhotoPos } = useDestinationPhoto()
const loaded = ref(false)
const error = ref(false)

const url = computed(() => getPhotoUrl(props.code, props.width || 800))
const alt = computed(() => getPhotoAlt(props.code))
const pos = computed(() => getPhotoPos(props.code))

// Respect prefers-reduced-motion + handle cached images (hydration fix)
const prefersReducedMotion = ref(false)
const imgRef = ref<HTMLImageElement>()
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // If the image was already loaded (browser cache / SSR), the @load event won't fire again
  if (imgRef.value && imgRef.value.complete && imgRef.value.naturalWidth > 0) {
    loaded.value = true
  }
})
const shouldAnimate = computed(() => !props.noAnimation && !prefersReducedMotion.value && loaded.value)
</script>

<template>
  <div class="relative overflow-hidden bg-gray-900" :class="heightClass || 'h-48'">
    <!-- Fallback: DestinationScene SVG while photo loads -->
    <div v-if="!loaded || error" class="absolute inset-0">
      <DestinationScene :code="code" />
    </div>
    <!-- Real photo with Ken Burns -->
    <img v-if="!error"
      ref="imgRef"
      :src="url"
      :alt="alt"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      :class="[
        loaded ? 'opacity-100' : 'opacity-0',
        shouldAnimate ? 'ken-burns' : ''
      ]"
      :style="{ objectPosition: pos }"
      @load="loaded = true"
      @error="error = true"
    />
    <slot />
  </div>
</template>

<style scoped>
@keyframes kenBurns {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.ken-burns {
  animation: kenBurns 20s ease-in-out infinite;
}
</style>
