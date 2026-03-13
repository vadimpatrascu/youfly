// Dynamic exchange rates fetched from /api/exchange-rate
const rates = ref<Record<string, number>>({
  'EUR': 19.5,
  'USD': 18.1,
  'GBP': 23.2,
  'RON': 3.9,
  'TRY': 0.58,
})

const showMdl = ref(false)
let rateFetched = false

async function fetchRates() {
  if (rateFetched || typeof window === 'undefined') return
  rateFetched = true
  try {
    const [eur, usd, gbp] = await Promise.all([
      $fetch<any>('/api/exchange-rate?pair=EUR-MDL'),
      $fetch<any>('/api/exchange-rate?pair=USD-MDL'),
      $fetch<any>('/api/exchange-rate?pair=GBP-MDL'),
    ])
    if (eur?.rate) rates.value['EUR'] = eur.rate
    if (usd?.rate) rates.value['USD'] = usd.rate
    if (gbp?.rate) rates.value['GBP'] = gbp.rate
  } catch {}
}

export function useCurrency() {
  // Fetch rates once on first use
  if (typeof window !== 'undefined' && !rateFetched) {
    fetchRates()
  }

  function convertToMdl(amount: string, currency: string): number {
    const value = parseFloat(amount)
    const rate = rates.value[currency?.toUpperCase()] ?? 1
    return currency?.toUpperCase() === 'MDL' ? value : value * rate
  }

  function formatWithMdl(amount: string, currency: string): string {
    if (showMdl.value && currency !== 'MDL') {
      const mdl = convertToMdl(amount, currency)
      return `${Math.round(mdl).toLocaleString('ro-MD')} MDL`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  function toggleCurrency() {
    showMdl.value = !showMdl.value
  }

  return { showMdl, formatWithMdl, toggleCurrency }
}
