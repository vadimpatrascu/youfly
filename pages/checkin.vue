<script setup lang="ts">
useSeo({ title: 'Check-in Online', description: 'Ghid complet pentru check-in online. Ferestre de check-in, taxe și sfaturi pentru Wizz Air, Ryanair, Turkish Airlines și altele.' })

const airlines = [
  { name: 'Wizz Air', code: 'W6', window: '30 de zile înainte — 3 ore înainte', url: 'https://wizzair.com', checkin: '100%', fee: 'Gratuit dacă ai locul inclus' },
  { name: 'Turkish Airlines', code: 'TK', window: '24 ore — 90 min înainte', url: 'https://turkishairlines.com', checkin: '95%', fee: 'Gratuit' },
  { name: 'Ryanair', code: 'FR', window: '60 zile — 2 ore înainte', url: 'https://ryanair.com', checkin: '92%', fee: '€/document fără check-in online' },
  { name: 'Austrian Airlines', code: 'OS', window: '47 ore — 45 min înainte', url: 'https://austrian.com', checkin: '88%', fee: 'Gratuit' },
  { name: 'LOT Polish Airlines', code: 'LO', window: '24 ore — 45 min înainte', url: 'https://lot.com', checkin: '85%', fee: 'Gratuit' },
  { name: 'Lufthansa', code: 'LH', window: '23 ore — 45 min înainte', url: 'https://lufthansa.com', checkin: '90%', fee: 'Gratuit' },
]

const steps = [
  { n: 1, title: 'Pregătește documentele', desc: 'Ai nevoie de: numărul de rezervare (PNR), pașaportul/buletinul de identitate, și adresa de email cu care ai rezervat.', icon: '📄' },
  { n: 2, title: 'Intră pe site-ul companiei', desc: 'Accesează site-ul oficial al companiei aeriene sau aplicația mobilă. Evită site-urile terțe!', icon: '💻' },
  { n: 3, title: 'Selectează locul', desc: 'Alege locul preferat în avion. Locurile gratuite sunt limitate, locurile premium costă extra.', icon: '✈️' },
  { n: 4, title: 'Descarcă boarding pass-ul', desc: 'Salvează boarding pass-ul pe telefon (Apple Wallet / Google Pay) sau tipărește-l. Ai nevoie de el la aeroport!', icon: '🎫' },
]

const tips = [
  'Fă check-in imediat ce se deschide fereastra pentru a alege cele mai bune locuri gratuit.',
  'Verifică dacă tarifele tău permite check-in online — unele bilete very basic nu permit.',
  'La Ryanair, penalitatea pentru check-in la aeroport poate fi €55 per pasager!',
  'Boarding pass-ul pe telefon este acceptat la toate aeroporturile europene majore.',
  'Ai grijă la ponderea bagajelor — verifică înainte de a pleca de acasă.',
]
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div class="text-5xl mb-4">🎫</div>
      <h1 class="text-4xl font-extrabold mb-3">Check-in Online</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">Economisești timp și bani făcând check-in online. Ghid complet pentru principalele companii aeriene.</p>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <!-- How to check in -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Cum faci check-in online</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="step in steps" :key="step.n"
            class="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
            <div class="text-3xl shrink-0">{{ step.icon }}</div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">{{ step.n }}</span>
                <h3 class="font-semibold text-gray-900">{{ step.title }}</h3>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Airlines table -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Ferestre check-in pe companie aeriană</h2>
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-5 py-3 font-semibold text-gray-700">Companie</th>
                  <th class="text-left px-5 py-3 font-semibold text-gray-700">Fereastra check-in</th>
                  <th class="text-left px-5 py-3 font-semibold text-gray-700">Taxă</th>
                  <th class="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="a in airlines" :key="a.code" class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <span class="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{{ a.code }}</span>
                      <span class="font-medium text-gray-900">{{ a.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-gray-600">{{ a.window }}</td>
                  <td class="px-5 py-4">
                    <span :class="a.fee.startsWith('Grat') ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50'"
                      class="text-xs px-2 py-1 rounded-full font-medium">
                      {{ a.fee }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <a :href="a.url" target="_blank" rel="noopener"
                      class="text-xs text-brand-600 hover:underline font-medium">Check-in →</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tips -->
      <section class="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-xl">💡</span> Sfaturi importante
        </h3>
        <ul class="space-y-2">
          <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
            <span class="text-amber-500 shrink-0 mt-0.5">•</span>
            {{ tip }}
          </li>
        </ul>
      </section>

      <!-- CTA -->
      <div class="text-center">
        <p class="text-gray-500 text-sm mb-4">Nu ai rezervat încă? Caută zborul tău acum.</p>
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          ✈ Caută zboruri
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
