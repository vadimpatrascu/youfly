export async function duffelFetch<T>(
  path: string,
  options: Parameters<typeof $fetch>[1] = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const token = config.duffelApiToken

  if (!token) {
    throw createError({ statusCode: 503, message: 'Duffel API not configured' })
  }

  try {
    return await $fetch<T>(`https://api.duffel.com${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers as Record<string, string> || {}),
      },
    })
  } catch (e: any) {
    // Re-throw with useful message
    const duffelError = e?.data?.errors?.[0]
    if (duffelError) {
      throw createError({
        statusCode: e.statusCode || 500,
        message: duffelError.message || duffelError.title || 'Duffel API error',
        data: e.data,
      })
    }
    throw e
  }
}
