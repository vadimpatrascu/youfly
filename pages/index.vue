<script setup lang="ts">
useHead({ title: 'YouFly — Book Flights Fast' })

const features = [
  { icon: '✈️', title: 'Hundreds of Airlines', desc: 'Search and compare flights from major carriers worldwide instantly.' },
  { icon: '💰', title: 'Best Prices', desc: 'Real-time prices with no hidden fees. What you see is what you pay.' },
  { icon: '⚡', title: 'Fast Booking', desc: 'Book your flight in under 5 minutes with our streamlined checkout.' },
]
</script>

<template>
  <div>
    <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white py-16 md:py-24 px-4">
      <div class="max-w-6xl mx-auto text-center mb-10">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4">Find Your Perfect Flight</h1>
        <p class="text-xl text-brand-200 max-w-2xl mx-auto">Search hundreds of airlines. Compare prices. Book in minutes.</p>
      </div>
      <SearchForm />
    </div>
    <div class="max-w-6xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="f in features" :key="f.title" class="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
          <div class="text-4xl mb-3">{{ f.icon }}</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ f.title }}</h3>
          <p class="text-gray-500 text-sm">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
