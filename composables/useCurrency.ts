// Exchange rates (static, updated periodically)
const EUR_TO_MDL = 19.5
const USD_TO_MDL = 17.8
const GBP_TO_MDL = 22.5

const showMdl = ref(false)

export function useCurrency() {
  function convertToMdl(amount: string, currency: string): number {
    const value = parseFloat(amount)
    switch (currency?.toUpperCase()) {
      case 'EUR': return value * EUR_TO_MDL
      case 'USD': return value * USD_TO_MDL
      case 'GBP': return value * GBP_TO_MDL
      case 'MDL': return value
      default: return value
    }
  }

  function formatWithMdl(amount: string, currency: string): string {
    if (showMdl.value && currency !== 'MDL') {
      const mdl = convertToMdl(amount, currency)
      return `${Math.round(mdl).toLocaleString()} MDL`
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
