export function useFormatters() {
  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  function formatTime(isoString: string): string {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(isoString: string): string {
    if (!isoString) return ''
    return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatPrice(amount: string, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(parseFloat(amount))
  }

  function stopsLabel(stops: number): string {
    if (stops === 0) return 'Direct'
    if (stops === 1) return '1 stop'
    return `${stops} stops`
  }

  return { formatDuration, formatTime, formatDate, formatPrice, stopsLabel }
}
