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
const inputRef = ref<HTMLInputElement>()

// Sync display text with modelValue
const displayText = ref(props.modelValue ? `${props.modelValue.city_name} (${props.modelValue.airport_iata || props.modelValue.iata_code})` : '')
watch(() => props.modelValue, (val) => {
  if (val) displayText.value = `${val.city_name} (${val.airport_iata || val.iata_code})`
  else displayText.value = ''
})

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  displayText.value = val
  query.value = val
  isOpen.value = true
  highlightedIndex.value = -1
  if (!val) emit('update:modelValue', null)
}

function select(airport: Airport) {
  emit('update:modelValue', airport)
  displayText.value = `${airport.city_name} (${airport.airport_iata || airport.iata_code})`
  isOpen.value = false
  query.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'ArrowDown') { e.preventDefault(); highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1) }
  if (e.key === 'ArrowUp') { e.preventDefault(); highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0) }
  if (e.key === 'Enter' && highlightedIndex.value >= 0) { e.preventDefault(); select(suggestions.value[highlightedIndex.value]) }
  if (e.key === 'Escape') { isOpen.value = false }
}

onClickOutside(inputRef, () => { isOpen.value = false })
</script>

<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="relative">
      <input
        ref="inputRef"
        :value="displayText"
        :placeholder="placeholder || 'City or airport'"
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 bg-white"
        @input="onInput"
        @focus="isOpen = suggestions.length > 0"
        @keydown="onKeydown"
        autocomplete="off"
      />
      <div v-if="isLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
    <div v-if="isOpen && suggestions.length" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <button
        v-for="(airport, i) in suggestions"
        :key="airport.iata_code + i"
        class="w-full px-4 py-3 text-left hover:bg-brand-50 flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
        :class="{ 'bg-brand-50': i === highlightedIndex }"
        @mousedown.prevent="select(airport)"
      >
        <span class="font-mono text-sm font-bold text-brand-600 w-10 shrink-0">{{ airport.airport_iata || airport.iata_code }}</span>
        <div>
          <div class="text-sm font-medium text-gray-900">{{ airport.city_name }}</div>
          <div class="text-xs text-gray-500">{{ airport.name }}</div>
        </div>
      </button>
    </div>
  </div>
</template>
