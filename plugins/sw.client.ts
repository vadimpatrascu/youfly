export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.register('/sw.js').then((registration) => {
    // Check for updates every 30 minutes
    setInterval(() => { registration.update() }, 30 * 60 * 1000)

    // When a new SW is waiting, prompt user to reload
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available — dispatch event for UpdateBanner component
          window.dispatchEvent(new CustomEvent('sw-update-available'))
        }
      })
    })
  }).catch(() => {
    // SW registration failed — app works fine without it
  })
})
