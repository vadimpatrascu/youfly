<script setup lang="ts">
import { useCompare } from '~/composables/useCompare'
const { compareList, clear } = useCompare()
const { formatPrice } = useFormatters()
const emit = defineEmits<{ select: [offer: any] }>()

function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function totalDuration(offer: any): number {
  const slices = offer.slices || []
  return slices.reduce((acc: number, s: any) => {
    return acc + (s.segments || []).reduce((a: number, seg: any) => a + (seg.duration || 0), 0)
  }, 0)
}

function stops(offer: any): number {
  return (offer.slices || []).reduce((acc: number, s: any) => acc + Math.max(0, (s.segments?.length || 1) - 1), 0)
}

function airline(offer: any): string {
  return offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.name || '—'
}

function depTime(offer: any): string {
  const dep = offer.slices?.[0]?.segments?.[0]?.departing_at
  if (!dep) return '—'
  return new Date(dep).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' })
}

function arrTime(offer: any): string {
  const segs = offer.slices?.[0]?.segments
  if (!segs?.length) return '—'
  const arr = segs[segs.length - 1]?.arriving_at
  if (!arr) return '—'
  return new Date(arr).toLocaleTimeString('ro-MD', { hour: '2-digit', minute: '2-digit' })
}

function baggage(offer: any): string {
  const pass = offer.passengers?.[0]
  if (!pass) return '—'
  const bags = pass.baggages?.find((b: any) => b.type === 'checked')
  if (!bags) return 'Fără bagaj'
  return `${bags.quantity} bagaj${bags.quantity > 1 ? 'e' : ''} inclus`
}

const [a, b] = [computed(() => compareList.value[0]), computed(() => compareList.value[1])]

const rows = computed(() => [
  { label: 'Preț', va: a.value ? formatPrice(a.value.total_amount, a.value.total_currency) : '—', vb: b.value ? formatPrice(b.value.total_amount, b.value.total_currency) : '—', better: a.value && b.value ? (parseFloat(a.value.total_amount) <= parseFloat(b.value.total_amount) ? 'a' : 'b') : null },
  { label: 'Durată', va: a.value ? formatDuration(totalDuration(a.value)) : '—', vb: b.value ? formatDuration(totalDuration(b.value)) : '—', better: a.value && b.value ? (totalDuration(a.value) <= totalDuration(b.value) ? 'a' : 'b') : null },
  { label: 'Escale', va: a.value ? (stops(a.value) === 0 ? 'Direct' : `${stops(a.value)} esc.`) : '—', vb: b.value ? (stops(b.value) === 0 ? 'Direct' : `${stops(b.value)} esc.`) : '—', better: a.value && b.value ? (stops(a.value) <= stops(b.value) ? 'a' : 'b') : null },
  { label: 'Companie', va: a.value ? airline(a.value) : '—', vb: b.value ? airline(b.value) : '—', better: null },
  { label: 'Plecare', va: a.value ? depTime(a.value) : '—', vb: b.value ? depTime(b.value) : '—', better: null },
  { label: 'Sosire', va: a.value ? arrTime(a.value) : '—', vb: b.value ? arrTime(b.value) : '—', better: null },
  { label: 'Bagaj', va: a.value ? baggage(a.value) : '—', vb: b.value ? baggage(b.value) : '—', better: null },
])
</script>

<template>
  <div v-if="compareList.length > 0"
    class="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-brand-500 shadow-2xl">
    <div class="max-w-6xl mx-auto px-4 py-3">
      <!-- Header row -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-semibold text-gray-700">
          Compară zboruri ({{ compareList.length }}/2)
        </span>
        <button @click="clear" class="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Șterge toate</button>
      </div>

      <!-- Compact compare if 1 flight -->
      <div v-if="compareList.length === 1" class="flex items-center gap-3">
        <div class="flex-1 bg-brand-50 rounded-xl px-4 py-2 text-sm">
          <span class="font-semibold text-brand-700">{{ airline(compareList[0]) }}</span>
          <span class="mx-2 text-gray-400">·</span>
          <span class="text-gray-700">{{ formatPrice(compareList[0].total_amount, compareList[0].total_currency) }}</span>
        </div>
        <p class="text-xs text-gray-400">Selectează al doilea zbor pentru comparație</p>
      </div>

      <!-- Full comparison table if 2 flights -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="text-left text-xs text-gray-400 font-medium pb-2 w-24">Criteriu</th>
              <th class="text-center pb-2 text-brand-700 font-semibold">
                {{ airline(a) }}
                <button @click="emit('select', a)" class="ml-2 px-3 py-1 bg-brand-600 text-white text-xs rounded-lg hover:bg-brand-700 transition-colors">Rezervă</button>
              </th>
              <th class="text-center pb-2 text-purple-700 font-semibold">
                {{ airline(b) }}
                <button @click="emit('select', b)" class="ml-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">Rezervă</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.label" class="border-t border-gray-100">
              <td class="py-1.5 text-xs text-gray-500">{{ row.label }}</td>
              <td class="py-1.5 text-center font-medium"
                :class="row.better === 'a' ? 'text-green-600' : 'text-gray-800'">
                {{ row.va }}
                <span v-if="row.better === 'a'" class="ml-1 text-green-500 text-xs">✓</span>
              </td>
              <td class="py-1.5 text-center font-medium"
                :class="row.better === 'b' ? 'text-green-600' : 'text-gray-800'">
                {{ row.vb }}
                <span v-if="row.better === 'b'" class="ml-1 text-green-500 text-xs">✓</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
