<script setup lang="ts">
const { t, locale } = useI18n()
useHead({ title: 'Admin — YouFly', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const secretInput = ref('')
const stats = ref<any>(null)
const isLoading = ref(false)
const error = ref('')
const { formatPrice } = useFormatters()

async function loadStats() {
  if (!secretInput.value.trim()) return
  isLoading.value = true
  error.value = ''
  try {
    stats.value = await $fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${secretInput.value.trim()}` },
    })
  } catch (e: any) {
    error.value = e?.data?.message || t('admin.loadError')
    stats.value = null
  } finally {
    isLoading.value = false
  }
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.title') }}</h1>
      <span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{{ t('admin.demo') }}</span>
    </div>

    <!-- Auth -->
    <div v-if="!stats" class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">{{ t('admin.auth') }}</h2>
        <div class="flex gap-3">
          <input v-model="secretInput" type="password" :placeholder="t('admin.secretPlaceholder')"
            :aria-label="t('admin.secretPlaceholder')"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            @keyup.enter="loadStats" />
          <button @click="loadStats" :disabled="isLoading"
            class="px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
            <span v-if="isLoading" class="flex gap-2 items-center">
              <div role="status" :aria-label="t('common.loading')" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            <span v-else>{{ t('admin.enter') }}</span>
          </button>
        </div>
        <p v-if="error" role="alert" class="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{{ error }}</p>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else class="space-y-6">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-black text-brand-600">{{ stats.summary.totalBookings }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('admin.totalBookings') }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-black text-green-600">{{ stats.summary.confirmedBookings }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('admin.confirmedBookings') }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-2xl font-black text-purple-600">€{{ stats.summary.totalRevenue.toFixed(0) }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('admin.totalRevenue') }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-black text-orange-600">{{ stats.summary.totalLeads }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('admin.searches') }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top destinations -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-3">{{ t('admin.topDestinations') }}</h3>
          <div v-if="!stats.topDestinations.length" class="text-gray-400 text-sm">{{ t('admin.noData') }}</div>
          <div v-else class="space-y-2">
            <div v-for="(d, i) in stats.topDestinations" :key="d.iata" class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-400 w-4">{{ i + 1 }}</span>
              <span class="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{{ d.iata }}</span>
              <div aria-hidden="true" class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="bg-brand-500 rounded-full h-2" :style="`width: ${(d.count / stats.topDestinations[0].count) * 100}%`"></div>
              </div>
              <span class="text-sm text-gray-600 w-6 text-right">{{ d.count }}</span>
            </div>
          </div>
        </div>

        <!-- Recent bookings -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-3">{{ t('admin.recentBookings') }}</h3>
          <div v-if="!stats.recentBookings.length" class="text-gray-400 text-sm">{{ t('admin.noBookings') }}</div>
          <div v-else class="space-y-2">
            <div v-for="b in stats.recentBookings" :key="b.id"
              class="flex items-center gap-2 text-sm bg-gray-50 rounded-xl px-3 py-2">
              <span class="font-mono font-bold text-brand-600 text-xs">{{ b.reference }}</span>
              <span class="flex-1 text-gray-500 text-xs">{{ formatDate(b.created_at) }}</span>
              <span class="font-semibold text-gray-900">{{ b.total_amount }} {{ b.currency }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ b.status === 'confirmed' ? t('myBooking.confirmed') : b.status === 'cancelled' ? t('myBooking.cancelled') : t('myBooking.pending') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent leads -->
      <div class="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900 mb-3">{{ t('admin.recentSearches') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 border-b">
                <th scope="col" class="pb-2 font-medium">{{ t('admin.colRoute') }}</th>
                <th scope="col" class="pb-2 font-medium">{{ t('admin.colDate') }}</th>
                <th scope="col" class="pb-2 font-medium">{{ t('admin.colPassengers') }}</th>
                <th scope="col" class="pb-2 font-medium">{{ t('admin.colClass') }}</th>
                <th scope="col" class="pb-2 font-medium">{{ t('admin.colSearchedAt') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="l in stats.recentLeads" :key="l.id" class="hover:bg-gray-50">
                <td class="py-2 font-mono font-semibold text-brand-600">{{ l.from_iata }} <span aria-hidden="true">→</span> {{ l.to_iata }}</td>
                <td class="py-2 text-gray-600">{{ l.depart_date }}</td>
                <td class="py-2">{{ l.adults }}</td>
                <td class="py-2 text-gray-500 text-xs">{{ l.cabin_class === 'economy' ? t('search.economy') : l.cabin_class === 'premium_economy' ? t('search.premiumEconomy') : l.cabin_class === 'business' ? t('search.business') : l.cabin_class === 'first' ? t('search.first') : l.cabin_class }}</td>
                <td class="py-2 text-gray-400 text-xs">{{ formatDate(l.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button @click="stats = null; secretInput = ''"
        class="text-sm text-gray-500 hover:text-gray-700 underline">
        ← {{ t('admin.logout') }}
      </button>
    </div>
  </div>
</template>
