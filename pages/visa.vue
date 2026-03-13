<script setup lang="ts">
useHead({ title: 'Cerințe Viză — Cetățeni Moldova | YouFly' })

const destinations = [
  // Visa-free
  { country: 'Uniunea Europeană', flag: '🇪🇺', visa: 'free', stay: '90 zile / 180 zile', note: 'Valabil cu pașaport biometric', category: 'Europe' },
  { country: 'Turcia', flag: '🇹🇷', visa: 'free', stay: '30 zile', note: 'Fără viză', category: 'Asia' },
  { country: 'Israel', flag: '🇮🇱', visa: 'free', stay: '90 zile', note: 'Fără viză', category: 'Orientul Mijlociu' },
  { country: 'Marea Britanie', flag: '🇬🇧', visa: 'required', stay: '—', note: 'Viză obligatorie', category: 'Europe' },
  { country: 'SUA', flag: '🇺🇸', visa: 'required', stay: 'max 90 zile (cu viză)', note: 'Viză B1/B2', category: 'America' },
  { country: 'Canada', flag: '🇨🇦', visa: 'required', stay: '6 luni (cu viză)', note: 'Viză de vizitator', category: 'America' },
  { country: 'Japonia', flag: '🇯🇵', visa: 'free', stay: '90 zile', note: 'Fără viză (pașaport biometric)', category: 'Asia' },
  { country: 'Emiratele Arabe Unite', flag: '🇦🇪', visa: 'arrival', stay: '30 zile', note: 'Viză la sosire', category: 'Orientul Mijlociu' },
  { country: 'Thailanda', flag: '🇹🇭', visa: 'free', stay: '30 zile', note: 'Scutire viză temporară', category: 'Asia' },
  { country: 'Egipt', flag: '🇪🇬', visa: 'arrival', stay: '30 zile', note: 'Viză la sosire (~$25)', category: 'Africa' },
  { country: 'Georgia', flag: '🇬🇪', visa: 'free', stay: '1 an', note: 'Fără viză', category: 'Europa de Est' },
  { country: 'Ucraina', flag: '🇺🇦', visa: 'free', stay: 'nelimitat', note: 'Fără viză', category: 'Europa de Est' },
  { country: 'Albania', flag: '🇦🇱', visa: 'free', stay: '90 zile', note: 'Fără viză', category: 'Europe' },
  { country: 'Serbia', flag: '🇷🇸', visa: 'free', stay: '30 zile', note: 'Fără viză', category: 'Europe' },
  { country: 'China', flag: '🇨🇳', visa: 'required', stay: '—', note: 'Viză obligatorie', category: 'Asia' },
  { country: 'India', flag: '🇮🇳', visa: 'evisa', stay: '30–90 zile', note: 'e-Viză online', category: 'Asia' },
]

const visaTypes = [
  { type: 'free', label: 'Fără viză', color: 'bg-green-100 text-green-700', icon: '✓' },
  { type: 'arrival', label: 'Viză la sosire', color: 'bg-blue-100 text-blue-700', icon: '✈' },
  { type: 'evisa', label: 'e-Viză online', color: 'bg-purple-100 text-purple-700', icon: '💻' },
  { type: 'required', label: 'Viză obligatorie', color: 'bg-red-100 text-red-700', icon: '!' },
]

const activeFilter = ref('all')
const filtered = computed(() =>
  activeFilter.value === 'all' ? destinations : destinations.filter(d => d.visa === activeFilter.value)
)
</script>

<template>
  <div>
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div class="text-5xl mb-4">🛂</div>
      <h1 class="text-4xl font-extrabold mb-3">Cerințe Viză</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">Verifică dacă ai nevoie de viză pentru destinația ta — actualizat pentru cetățenii Republicii Moldova.</p>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-10">
      <!-- Important note -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
        <span class="text-2xl shrink-0">⚠️</span>
        <div>
          <p class="font-semibold text-amber-800 text-sm">Informații orientative</p>
          <p class="text-amber-700 text-xs mt-1">Regulile vizelor se schimbă frecvent. Verificați întotdeauna la ambasada sau consulatul destinației înainte de plecare.</p>
        </div>
      </div>

      <!-- Filter by visa type -->
      <div class="flex gap-2 flex-wrap mb-6">
        <button @click="activeFilter = 'all'"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
          :class="activeFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'">
          Toate ({{ destinations.length }})
        </button>
        <button v-for="vt in visaTypes" :key="vt.type"
          @click="activeFilter = vt.type"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
          :class="activeFilter === vt.type ? vt.color + ' border-transparent' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'">
          {{ vt.icon }} {{ vt.label }} ({{ destinations.filter(d => d.visa === vt.type).length }})
        </button>
      </div>

      <!-- Destination list -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="dest in filtered" :key="dest.country"
          class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ dest.flag }}</span>
            <div>
              <div class="font-medium text-gray-900 text-sm">{{ dest.country }}</div>
              <div class="text-xs text-gray-500">{{ dest.stay }} · {{ dest.note }}</div>
            </div>
          </div>
          <span class="text-xs px-3 py-1 rounded-full font-semibold shrink-0"
            :class="visaTypes.find(v => v.type === dest.visa)?.color || 'bg-gray-100 text-gray-600'">
            {{ visaTypes.find(v => v.type === dest.visa)?.label }}
          </span>
        </div>
      </div>

      <!-- EU section highlight -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">🇪🇺 Zona Schengen — Regula 90/180</h3>
        <p class="text-sm text-gray-700 leading-relaxed mb-3">
          Cetățenii moldoveni cu pașaport biometric pot călători în spațiul Schengen (și alte țări UE) fără viză pentru maximum <strong>90 de zile</strong> în orice perioadă de <strong>180 de zile</strong>.
        </p>
        <p class="text-xs text-gray-500">Important: numărul de zile se calculează cumulativ, nu per țară!</p>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          ✈ Caută zborul tău
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
