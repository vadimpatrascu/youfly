<script setup lang="ts">
useSeo({ title: 'Reguli Bagaj', description: 'Regulile de bagaj pentru principalele companii aeriene. Dimensiuni, greutăți, taxe și articole interzise în avion.' })

const airlines = [
  {
    name: 'Wizz Air',
    code: 'W6',
    personal: { size: '40×30×20 cm', weight: 'max 10 kg', note: 'Inclus în toate tarifele' },
    cabin: { size: '55×40×20 cm', weight: 'max 10 kg', fee: '€10–25', note: 'Tarif Plus și Priority' },
    checked: { weight: '20 kg', fee: '€20–50', note: 'Per zbor' },
  },
  {
    name: 'Ryanair',
    code: 'FR',
    personal: { size: '40×20×25 cm', weight: 'fără limitare', note: 'Gratuit sub scaun' },
    cabin: { size: '55×40×20 cm', weight: 'max 10 kg', fee: '€10–30', note: 'Priority sau Priority & 2 Bags' },
    checked: { weight: '20 kg / 15 kg', fee: '€12–40', note: 'Rezervat online' },
  },
  {
    name: 'Turkish Airlines',
    code: 'TK',
    personal: { size: 'nu există limitare separată', weight: '', note: 'Include în bagaj de mână' },
    cabin: { size: '55×40×23 cm', weight: 'max 8 kg', fee: 'Gratuit', note: 'Economy inclus' },
    checked: { weight: '20 kg (Economy)', fee: 'Inclus', note: 'Economy include 1 bagaj' },
  },
  {
    name: 'Austrian Airlines',
    code: 'OS',
    personal: { size: '40×30×15 cm', weight: 'max 8 kg', note: 'Sub scaun față' },
    cabin: { size: '55×40×20 cm', weight: 'max 8 kg', fee: 'Gratuit', note: 'Inclus' },
    checked: { weight: '23 kg', fee: 'Inclus / €25+', note: 'Depinde de tarif' },
  },
  {
    name: 'LOT Polish Airlines',
    code: 'LO',
    personal: { size: '40×35×20 cm', weight: 'max 5 kg', note: 'Inclus' },
    cabin: { size: '55×40×23 cm', weight: 'max 8 kg', fee: 'Gratuit', note: 'Inclus' },
    checked: { weight: '23 kg', fee: 'Inclus / €20+', note: 'Tarif Economy Light: €20' },
  },
]

const prohibitedItems = [
  { cat: 'Lichide', rule: 'Max 100 ml per recipient, toate în pungă transparentă de 1L (bagaj de mână)', icon: '💧' },
  { cat: 'Baterii litiu', rule: 'Max 100Wh în bagaj de mână; >100Wh necesită aprobare; interzise în bagaj la cală', icon: '🔋' },
  { cat: 'Obiecte ascuțite', rule: 'Interzise în bagaj de mână; permise în bagaj la cală (protejate)', icon: '🔪' },
  { cat: 'Spray-uri', rule: 'Spray-urile de securitate, gazele lacrimogene — interzise complet', icon: '🫧' },
  { cat: 'Explozibili', rule: 'Artificii, muniție, substanțe inflamabile — complet interzise', icon: '💣' },
  { cat: 'Magnetice puternice', rule: 'Magneți puternici care pot perturba navigarea — interzisi', icon: '🧲' },
]
</script>

<template>
  <div>
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div class="text-5xl mb-4">🧳</div>
      <h1 class="text-4xl font-extrabold mb-3">Reguli Bagaj</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">Tot ce trebuie să știi despre bagaje înainte de zbor.</p>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <!-- Quick tips -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="tip in [
          { icon: '📏', title: 'Verifică dimensiunile', desc: 'Chiar dacă geanta pare mică, dimensiunile exacte contează. Companiile low-cost sunt stricte.' },
          { icon: '⚖️', title: 'Cântărește acasă', desc: 'Bagajele supraponderale la aeroport pot costa €50+. Cântărește-le înainte de plecare.' },
          { icon: '🏷️', title: 'Etichetează bagajele', desc: 'Pune datele tale de contact în interior și exterior. Evită pierderea definitivă a bagajului.' },
        ]" :key="tip.title"
          class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="text-3xl mb-3">{{ tip.icon }}</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ tip.title }}</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ tip.desc }}</p>
        </div>
      </div>

      <!-- Airlines table -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Politica de bagaj per companie</h2>
        <div class="space-y-4">
          <div v-for="a in airlines" :key="a.code"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200">
              <span class="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{{ a.code }}</span>
              <h3 class="font-semibold text-gray-900">{{ a.name }}</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-2">👜 Articol personal</p>
                <p class="text-sm font-medium text-gray-900">{{ a.personal.size }}</p>
                <p v-if="a.personal.weight" class="text-sm text-gray-600">{{ a.personal.weight }}</p>
                <p class="text-xs text-green-600 mt-1">{{ a.personal.note }}</p>
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-2">🎒 Bagaj de mână (cabină)</p>
                <p class="text-sm font-medium text-gray-900">{{ a.cabin.size }}</p>
                <p class="text-sm text-gray-600">{{ a.cabin.weight }}</p>
                <p class="text-xs text-brand-600 mt-1 font-medium">{{ a.cabin.fee }}</p>
                <p class="text-xs text-gray-500">{{ a.cabin.note }}</p>
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-2">🧳 Bagaj la cală</p>
                <p class="text-sm font-medium text-gray-900">{{ a.checked.weight }}</p>
                <p class="text-xs text-brand-600 mt-1 font-medium">{{ a.checked.fee }}</p>
                <p class="text-xs text-gray-500">{{ a.checked.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Prohibited items -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Articole interzise în avion</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="item in prohibitedItems" :key="item.cat"
            class="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
            <span class="text-2xl shrink-0">{{ item.icon }}</span>
            <div>
              <h4 class="font-semibold text-gray-900 text-sm mb-1">{{ item.cat }}</h4>
              <p class="text-xs text-gray-600 leading-relaxed">{{ item.rule }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="text-center">
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          ✈ Rezervă zborul tău
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
