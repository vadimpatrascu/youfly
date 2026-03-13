// Compare up to 2 flights side-by-side
const compareList = ref<any[]>([])

export function useCompare() {
  function toggle(offer: any) {
    const idx = compareList.value.findIndex(o => o.id === offer.id)
    if (idx >= 0) {
      compareList.value.splice(idx, 1)
    } else if (compareList.value.length < 2) {
      compareList.value.push(offer)
    }
  }

  function isSelected(id: string) {
    return compareList.value.some(o => o.id === id)
  }

  function clear() {
    compareList.value = []
  }

  return { compareList, toggle, isSelected, clear }
}
