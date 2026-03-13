interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'info', duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, message, type, duration })
  }

  function remove(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message: string) { show(message, 'success') }
  function error(message: string) { show(message, 'error') }
  function info(message: string) { show(message, 'info') }
  function warning(message: string) { show(message, 'warning') }

  return { toasts, show, remove, success, error, info, warning }
}
