/**
 * Syncs search state with URL query params so search results are shareable.
 * Usage: call setupUrlSync() in the search store after navigation.
 */
export function useUrlSearch() {
  const route = useRoute()
  const router = useRouter()

  function encodeSearchToQuery(params: {
    from?: string
    to?: string
    dep?: string
    ret?: string
    adults?: number
    children?: number
    infants?: number
    cabin?: string
    type?: string
  }) {
    const q: Record<string, string> = {}
    if (params.from) q.from = params.from
    if (params.to) q.to = params.to
    if (params.dep) q.dep = params.dep
    if (params.ret) q.ret = params.ret
    if (params.adults && params.adults > 1) q.adults = String(params.adults)
    if (params.children) q.children = String(params.children)
    if (params.infants) q.infants = String(params.infants)
    if (params.cabin && params.cabin !== 'economy') q.cabin = params.cabin
    if (params.type && params.type !== 'oneway') q.type = params.type
    return q
  }

  function pushSearchToUrl(params: Parameters<typeof encodeSearchToQuery>[0]) {
    router.push({ path: '/search', query: encodeSearchToQuery(params) })
  }

  /** Replace current URL params without adding a history entry (use when already on /search) */
  function replaceSearchInUrl(params: Parameters<typeof encodeSearchToQuery>[0]) {
    router.replace({ query: encodeSearchToQuery(params) })
  }

  return { pushSearchToUrl, replaceSearchInUrl, encodeSearchToQuery }
}
