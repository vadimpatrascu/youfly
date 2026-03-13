export function useCountdown(expiresAt: Ref<string | null>) {
  const secondsLeft = ref(0)
  let timer: ReturnType<typeof setInterval>

  function update() {
    if (!expiresAt.value) return
    const diff = Math.floor((new Date(expiresAt.value).getTime() - Date.now()) / 1000)
    secondsLeft.value = Math.max(0, diff)
    if (secondsLeft.value === 0) clearInterval(timer)
  }

  watch(expiresAt, (val) => {
    clearInterval(timer)
    if (val) {
      update()
      timer = setInterval(update, 1000)
    }
  }, { immediate: true })

  onUnmounted(() => clearInterval(timer))

  const formatted = computed(() => {
    const m = Math.floor(secondsLeft.value / 60)
    const s = secondsLeft.value % 60
    return m + ':' + String(s).padStart(2, '0')
  })

  const isExpiringSoon = computed(() => secondsLeft.value > 0 && secondsLeft.value <= 300)
  const isExpired = computed(() => secondsLeft.value === 0 && !!expiresAt.value)

  return { secondsLeft, formatted, isExpiringSoon, isExpired }
}
