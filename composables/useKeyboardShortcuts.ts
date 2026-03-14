interface Shortcut {
  key: string
  description: string
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  function handleKey(e: KeyboardEvent) {
    // Don't trigger when typing in inputs
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    const shortcut = shortcuts.find(s => s.key === e.key)
    if (shortcut) {
      e.preventDefault()
      shortcut.action()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKey))
  onUnmounted(() => window.removeEventListener('keydown', handleKey))

  return { shortcuts }
}
