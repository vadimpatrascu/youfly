/**
 * Dynamic OG image endpoint
 * Usage: /api/og?from=RMO&to=BCN&price=31
 * Returns an SVG image for social sharing
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const from = String(query.from || 'RMO').toUpperCase().substring(0, 3)
  const to = String(query.to || '').toUpperCase().substring(0, 3)
  const price = String(query.price || '').substring(0, 10)

  const title = to ? `${from} → ${to}` : 'YouFly'
  const subtitle = price ? `from €${price}` : 'Search & book cheap flights'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#030712"/>
      <stop offset="100%" style="stop-color:#0c1222"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0ea5e9"/>
      <stop offset="100%" style="stop-color:#38bdf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative flight path -->
  <path d="M0,400 Q300,200 600,300 Q900,400 1200,200" fill="none" stroke="#0ea5e9" stroke-width="1" opacity="0.15"/>
  <path d="M0,450 Q400,250 700,350 Q1000,450 1200,150" fill="none" stroke="#0ea5e9" stroke-width="1" opacity="0.08"/>
  <!-- Brand -->
  <text x="80" y="90" font-family="system-ui,sans-serif" font-size="28" font-weight="900" fill="#0ea5e9">You</text>
  <text x="137" y="90" font-family="system-ui,sans-serif" font-size="28" font-weight="900" fill="white">Fly</text>
  <!-- Plane icon -->
  <text x="600" y="250" font-family="system-ui,sans-serif" font-size="60" fill="#0ea5e9" text-anchor="middle" opacity="0.3">✈</text>
  <!-- Route -->
  <text x="600" y="340" font-family="system-ui,sans-serif" font-size="72" font-weight="900" fill="white" text-anchor="middle" letter-spacing="4">${escapeXml(title)}</text>
  <!-- Price -->
  <text x="600" y="410" font-family="system-ui,sans-serif" font-size="32" fill="#94a3b8" text-anchor="middle">${escapeXml(subtitle)}</text>
  <!-- Accent bar -->
  <rect x="500" y="440" width="200" height="4" rx="2" fill="url(#accent)"/>
  <!-- Footer -->
  <text x="600" y="560" font-family="system-ui,sans-serif" font-size="18" fill="#475569" text-anchor="middle">youfly-xi.vercel.app — Book flights from Chișinău</text>
</svg>`

  setHeader(event, 'Content-Type', 'image/svg+xml')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=604800')
  return svg
})

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
