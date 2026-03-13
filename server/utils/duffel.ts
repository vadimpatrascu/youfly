export async function duffelFetch<T>(
  path: string,
  options: Parameters<typeof $fetch>[1] = {}
): Promise<T> {
  const config = useRuntimeConfig()
  return $fetch<T>(`https://api.duffel.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.duffelApiToken}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    },
  })
}
