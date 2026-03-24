/**
 * Animated count-up effect — counts from 0 to target number when element enters viewport.
 */
export function useCountUp(target: number, duration = 1500) {
  const current = ref(0)
  const el = ref<HTMLElement>()
  const hasAnimated = ref(false)

  onMounted(() => {
    if (!el.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current.value = target
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.value) {
        hasAnimated.value = true
        const start = performance.now()
        function step(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
          current.value = Math.round(eased * target)
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    }, { threshold: 0.3 })

    observer.observe(el.value)
  })

  return { current, el }
}
