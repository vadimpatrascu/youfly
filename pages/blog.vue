<script setup lang="ts">
useHead({ title: 'Blog — Sfaturi de Călătorie | YouFly' })

const articles = [
  {
    slug: 'cum-sa-gasesti-bilete-ieftine',
    title: 'Cum să găsești bilete de avion ieftine în 2025',
    excerpt: 'Descoperă strategiile dovedite pentru a reduce costul zborurilor cu până la 50%. De la timing-ul rezervării până la aeroporturile alternative.',
    date: '2025-03-10',
    readTime: '5 min',
    category: 'Sfaturi',
    emoji: '💰',
  },
  {
    slug: 'top-destinatii-moldova',
    title: 'Top 10 destinații accesibile din Moldova în 2025',
    excerpt: 'De la plajele turcești până la capitalele europene — cele mai populare destinații alese de moldoveni și prețurile medii ale biletelor.',
    date: '2025-03-05',
    readTime: '7 min',
    category: 'Destinații',
    emoji: '🌍',
  },
  {
    slug: 'bagaj-de-mana-ghid-complet',
    title: 'Ghid complet: bagajul de mână în 2025',
    excerpt: 'Regulile fiecărei companii aeriene, trucuri pentru a încăpea totul în 10 kg și lista obiectelor interzise actualizată.',
    date: '2025-02-28',
    readTime: '8 min',
    category: 'Pregătire',
    emoji: '🎒',
  },
  {
    slug: 'rezervare-cu-escala-vs-direct',
    title: 'Zbor direct vs. cu escală: ce merită mai mult?',
    excerpt: 'Analizăm costurile, confortul și riscurile fiecărei opțiuni. Când merită să alegi zboruri cu conexiuni și cum să le gestionezi.',
    date: '2025-02-20',
    readTime: '6 min',
    category: 'Sfaturi',
    emoji: '✈️',
  },
  {
    slug: 'asigurare-calatorie-de-ce',
    title: 'De ce ai nevoie de asigurare de călătorie',
    excerpt: 'Situații reale în care asigurarea te poate salva de cheltuieli uriașe. Ce acoperă, ce nu acoperă și cum alegi cea mai bună opțiune.',
    date: '2025-02-15',
    readTime: '5 min',
    category: 'Siguranță',
    emoji: '🛡️',
  },
  {
    slug: 'istanbul-ghid-3-zile',
    title: 'Istanbul în 3 zile: ghidul complet al călătorului',
    excerpt: 'Ruta optimă, restaurantele locale, atracțiile imperdibile și sfaturi practice pentru cea mai vibrantă metropolă de pe malul Bosforului.',
    date: '2025-02-10',
    readTime: '10 min',
    category: 'Ghiduri',
    emoji: '🕌',
  },
]

const categories = ['Toate', 'Sfaturi', 'Destinații', 'Pregătire', 'Siguranță', 'Ghiduri']
const activeCategory = ref('Toate')

const filtered = computed(() =>
  activeCategory.value === 'Toate'
    ? articles
    : articles.filter(a => a.category === activeCategory.value)
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-MD', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Blog de Călătorie</h1>
      <p class="text-gray-500 max-w-xl mx-auto">Sfaturi practice, ghiduri de destinații și strategii pentru a călători mai inteligent și mai ieftin.</p>
    </div>

    <!-- Category filter -->
    <div class="flex gap-2 flex-wrap justify-center mb-8">
      <button v-for="cat in categories" :key="cat"
        @click="activeCategory = cat"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all border"
        :class="activeCategory === cat
          ? 'bg-brand-600 text-white border-brand-600'
          : 'border-gray-200 text-gray-600 hover:border-brand-300 bg-white'">
        {{ cat }}
      </button>
    </div>

    <!-- Featured article -->
    <div v-if="activeCategory === 'Toate'" class="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-8 mb-8">
      <span class="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">RECOMANDAT</span>
      <div class="text-5xl my-4">{{ articles[0].emoji }}</div>
      <h2 class="text-2xl font-bold mb-3">{{ articles[0].title }}</h2>
      <p class="text-brand-200 mb-5 leading-relaxed">{{ articles[0].excerpt }}</p>
      <div class="flex items-center gap-4 text-sm text-brand-300">
        <span>{{ formatDate(articles[0].date) }}</span>
        <span>·</span>
        <span>{{ articles[0].readTime }} citit</span>
      </div>
    </div>

    <!-- Article grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <article v-for="article in (activeCategory === 'Toate' ? filtered.slice(1) : filtered)" :key="article.slug"
        class="bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
        <div class="text-3xl mb-3">{{ article.emoji }}</div>
        <span class="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded-full">{{ article.category }}</span>
        <h3 class="text-lg font-bold text-gray-900 mt-3 mb-2 group-hover:text-brand-600 transition-colors leading-tight">
          {{ article.title }}
        </h3>
        <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ article.excerpt }}</p>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>{{ formatDate(article.date) }}</span>
          <span class="flex items-center gap-1 text-brand-600 font-medium group-hover:gap-2 transition-all">
            Citește <span>→</span>
          </span>
        </div>
      </article>
    </div>

    <!-- CTA -->
    <div class="mt-12 text-center bg-gray-50 rounded-2xl p-8 border border-gray-200">
      <div class="text-4xl mb-3">✈️</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Gata să rezervi?</h3>
      <p class="text-gray-500 text-sm mb-5">Caută zboruri ieftine din Chișinău cu prețuri în timp real.</p>
      <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
        Caută zboruri
      </NuxtLink>
    </div>
  </div>
</template>
