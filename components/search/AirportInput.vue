<script setup lang="ts">
import type { Airport } from '~/stores/search'

const props = defineProps<{
  modelValue: Airport | null
  placeholder?: string
  label?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [Airport | null] }>()

const { query, suggestions, isLoading } = useAirports()
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const containerRef = ref<HTMLDivElement>()

const displayText = ref(props.modelValue ? formatDisplay(props.modelValue) : '')

function formatDisplay(a: Airport) {
  return `${a.city_name} (${a.airport_iata || a.iata_code})`
}

watch(() => props.modelValue, (val) => {
  displayText.value = val ? formatDisplay(val) : ''
})

watch(suggestions, (s) => {
  if (s.length > 0) isOpen.value = true
})

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  displayText.value = val
  query.value = val
  highlightedIndex.value = -1
  if (!val) {
    emit('update:modelValue', null)
    isOpen.value = false
  }
}

function select(airport: Airport) {
  emit('update:modelValue', airport)
  displayText.value = formatDisplay(airport)
  isOpen.value = false
  query.value = ''
  suggestions.value = []
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!isOpen.value && suggestions.value.length) isOpen.value = true
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && highlightedIndex.value >= 0) {
    e.preventDefault()
    select(suggestions.value[highlightedIndex.value])
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onClickOutside(containerRef, () => { isOpen.value = false })
</script>

<template>
  <div class="relative" ref="containerRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="relative">
      <input
        :value="displayText"
        :placeholder="placeholder"
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 bg-white"
        @input="onInput"
        @keydown="onKeydown"
        autocomplete="off"
        spellcheck="false"
      />
      <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="modelValue" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</div>
    </div>
    <div
      v-if="isOpen && suggestions.length"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
      style="max-height: 280px; overflow-y: auto;"
    >
      <button
        v-for="(airport, i) in suggestions"
        :key="airport.iata_code + i"
        class="w-full px-4 py-3 text-left flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
        :class="i === highlightedIndex ? 'bg-brand-50' : 'hover:bg-gray-50'"
        @mousedown.prevent="select(airport)"
      >
        <span class="font-mono text-xs font-bold text-brand-600 w-10 shrink-0 bg-brand-100 rounded px-1 py-0.5 text-center">{{ airport.airport_iata || airport.iata_code }}</span>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-900 truncate">{{ airport.city_name }}</div>
          <div class="text-xs text-gray-500 truncate">{{ airport.name }}</div>
        </div>
      </button>
    </div>
  </div>
</template>
