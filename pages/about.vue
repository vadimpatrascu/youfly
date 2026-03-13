<script setup lang="ts">
const { t } = useI18n()
useHead({ title: 'Despre YouFly — YouFly' })
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <!-- Hero -->
    <div class="text-center mb-16">
      <div class="text-6xl mb-6">✈️</div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Despre YouFly</h1>
      <p class="text-xl text-gray-500 max-w-2xl mx-auto">
        Platforma modernă de rezervare a biletelor de avion, construită pentru Moldova și lumea întreagă.
      </p>
    </div>

    <!-- Mission -->
    <div class="bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Misiunea noastră</h2>
      <p class="text-gray-700 text-lg leading-relaxed">
        YouFly face rezervarea biletelor de avion accesibilă, simplă și transparentă pentru fiecare moldovean.
        Credem că toată lumea merită să călătorească fără bătaie de cap — de aceea am construit o platformă
        care caută sute de companii aeriene în timp real și îți oferă cele mai bune prețuri fără taxe ascunse.
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div v-for="stat in [
        { number: '500+', label: 'Companii aeriene' },
        { number: '10K+', label: 'Destinații' },
        { number: '5 min', label: 'Rezervare rapidă' },
        { number: '24/7', label: 'Suport clienți' },
      ]" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
        <div class="text-3xl font-black text-brand-600 mb-1">{{ stat.number }}</div>
        <div class="text-sm text-gray-500">{{ stat.label }}</div>
      </div>
    </div>

    <!-- How it works -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Cum funcționează</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="(step, i) in [
          { icon: '🔍', title: 'Caută', desc: 'Introduceți destinația, data și numărul de pasageri. Căutăm instant sute de opțiuni.' },
          { icon: '✈️', title: 'Compară', desc: 'Filtrați după preț, durata zborului sau numărul de escale. Alegeți oferta perfectă.' },
          { icon: '🎫', title: 'Rezervă', desc: 'Completați datele pasagerilor și plătiți securizat. Primiți confirmarea instant.' },
        ]" :key="i"
          class="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
          <div class="text-4xl mb-3">{{ step.icon }}</div>
          <div class="text-sm font-black text-brand-600 uppercase tracking-widest mb-2">Pasul {{ i + 1 }}</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</h3>
          <p class="text-sm text-gray-500">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Technology -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Tehnologie de top</h2>
      <p class="text-gray-600 mb-4">
        YouFly este alimentat de <strong>Duffel</strong> — liderul mondial în API-uri de călătorii,
        cu acces direct la sistemele de rezervare ale companiilor aeriene. Asta înseamnă prețuri
        reale, în timp real, fără intermediari.
      </p>
      <div class="flex items-center gap-4 flex-wrap">
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Duffel API</span>
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Nuxt.js 3</span>
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Supabase</span>
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Vercel</span>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center">
      <NuxtLink to="/"
        class="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg">
        Caută zboruri acum →
      </NuxtLink>
    </div>
  </div>
</template>
