export function useFormatters() {
  const { t, locale } = useI18n()
  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  function formatTime(isoString: string): string {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(isoString: string): string {
    if (!isoString) return ''
    return new Date(isoString).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatPrice(amount: string, currency: string): string {
    return new Intl.NumberFormat(locale.value, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(parseFloat(amount))
  }

  function stopsLabel(stops: number): string {
    if (stops === 0) return t('flightCard.direct')
    if (stops === 1) return `1 ${t('flightCard.stop')}`
    return `${stops} ${t('flightCard.stops')}`
  }

  return { formatDuration, formatTime, formatDate, formatPrice, stopsLabel }
}
