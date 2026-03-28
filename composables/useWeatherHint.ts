/**
 * Static weather hints based on destination and month.
 * No API calls — just curated data for popular YouFly destinations.
 */

interface WeatherHint {
  temp: string
  icon: string
  label: string
}

const weatherData: Record<string, number[]> = {
  // Average monthly temperatures (°C) Jan-Dec
  OTP: [0, 2, 8, 14, 20, 24, 27, 26, 21, 14, 7, 2],
  IST: [6, 6, 9, 13, 18, 23, 26, 26, 22, 17, 12, 8],
  LTN: [5, 5, 8, 11, 15, 18, 21, 20, 17, 13, 8, 5],
  BCN: [10, 11, 13, 15, 19, 23, 26, 26, 23, 18, 14, 11],
  CDG: [4, 5, 9, 12, 16, 19, 22, 21, 18, 13, 8, 5],
  VIE: [1, 2, 7, 13, 18, 21, 24, 23, 18, 12, 6, 2],
  MXP: [3, 5, 10, 15, 20, 24, 27, 26, 22, 15, 9, 4],
  TLV: [13, 14, 16, 20, 24, 27, 29, 30, 28, 25, 20, 15],
  FRA: [2, 3, 8, 13, 17, 21, 23, 22, 18, 12, 7, 3],
  DXB: [19, 20, 23, 27, 32, 34, 36, 36, 33, 29, 25, 21],
  WAW: [-1, 0, 5, 11, 17, 20, 22, 22, 17, 11, 5, 1],
  ATH: [10, 10, 13, 17, 22, 27, 30, 30, 26, 20, 15, 11],
  NAP: [9, 9, 12, 15, 20, 24, 27, 27, 24, 19, 13, 10],
  BER: [1, 2, 6, 11, 16, 19, 22, 22, 17, 11, 6, 2],
  PRG: [0, 1, 6, 11, 16, 19, 22, 21, 17, 11, 5, 1],
  LIS: [11, 12, 14, 16, 18, 22, 24, 25, 22, 19, 14, 12],
  CPH: [1, 1, 4, 9, 14, 17, 20, 19, 16, 10, 6, 3],
  AMS: [4, 4, 7, 10, 14, 17, 19, 19, 16, 12, 8, 5],
}

function getWeatherIcon(temp: number, month: number): string {
  if (temp >= 28) return '☀️'
  if (temp >= 22) return '🌤️'
  if (temp >= 15) return '⛅'
  if (temp >= 8) return '🌥️'
  if (temp >= 0) return '❄️'
  return '🥶'
}

export function useWeatherHint() {
  const { t } = useI18n()

  function getHint(iataCode: string, dateStr?: string): WeatherHint | null {
    const code = iataCode?.toUpperCase()
    const temps = weatherData[code]
    if (!temps) return null

    const month = dateStr ? new Date(dateStr).getMonth() : new Date().getMonth()
    const temp = temps[month]
    const icon = getWeatherIcon(temp, month)

    return {
      temp: `${temp}°C`,
      icon,
      label: temp >= 25 ? t('weather.hot') : temp >= 15 ? t('weather.warm') : temp >= 5 ? t('weather.cool') : t('weather.cold'),
    }
  }

  return { getHint }
}
