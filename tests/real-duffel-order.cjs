// Proves the ORDER/BOOKING half of the pipeline against the REAL Duffel TEST API,
// independent of the Payments feature (which the account doesn't have enabled).
// In test mode Duffel funds the balance automatically, so an instant order paid
// from balance should succeed — proving our order payload + passenger mapping.
const TOKEN = process.env.DUFFEL_TEST_TOKEN
const H = {
  'Authorization': `Bearer ${TOKEN}`,
  'Duffel-Version': 'v2',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const api = async (path, method = 'GET', body, retries = 3) => {
  for (let i = 0; ; i++) {
    const r = await fetch('https://api.duffel.com' + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
    const j = await r.json().catch(() => ({}))
    if (r.status === 503 && i < retries) { await sleep(1500 * (i + 1)); continue }
    return { status: r.status, j }
  }
}

async function main() {
  const dep = new Date(Date.now() + 40 * 86400000).toISOString().split('T')[0]
  console.log('1. offer request RMO->OTP', dep)
  const orq = await api('/air/offer_requests?return_offers=true', 'POST', {
    data: { slices: [{ origin: 'RMO', destination: 'OTP', departure_date: dep }],
      passengers: [{ type: 'adult' }], cabin_class: 'economy' },
  })
  if (orq.status >= 300) { console.log('  offer request FAILED', orq.status, JSON.stringify(orq.j).slice(0, 300)); process.exit(1) }
  const offers = orq.j.data.offers || []
  console.log('  offers:', offers.length)
  // Try offers cheapest-first; some Duffel test offers expire instantly, so
  // re-fetch each offer immediately before ordering and move on if it's gone.
  // Prefer Duffel Airways (the stable test carrier) — real-airline test offers
  // often can't be ordered in the sandbox.
  const isDuffelAir = o => /duffel/i.test(o.owner?.name || '') || ['ZZ', 'Zulu'].includes(o.owner?.iata_code)
  const sorted = [...offers].sort((a, b) => {
    if (isDuffelAir(a) !== isDuffelAir(b)) return isDuffelAir(a) ? -1 : 1
    return parseFloat(a.total_amount) - parseFloat(b.total_amount)
  })
  console.log('  carriers:', [...new Set(offers.map(o => o.owner?.name))].join(', '))
  console.log('2. create instant order paid from balance (trying up to 8 offers)')
  for (const cand of sorted.slice(0, 8)) {
    const fresh = await api(`/air/offers/${cand.id}?return_available_services=false`)
    if (fresh.status >= 300) { console.log('   -', cand.id.slice(0, 18), 'refetch', fresh.status); continue }
    const offer = fresh.j.data
    const pid = offer.passengers[0].id
    const order = await api('/air/orders', 'POST', {
      data: {
        type: 'instant',
        selected_offers: [offer.id],
        payments: [{ type: 'balance', amount: offer.total_amount, currency: offer.total_currency }],
        passengers: [{
          id: pid, title: 'mr', gender: 'm', given_name: 'Vadim', family_name: 'Patrascu',
          born_on: '1990-05-10', email: 'vadim@example.com', phone_number: '+37360123456',
        }],
        metadata: { test: 'youfly-integration' },
      },
    })
    if (order.status < 300) {
      console.log('  ✅ REAL TEST ORDER CREATED:', order.j.data.booking_reference, '/', order.j.data.id)
      console.log('  charged from balance:', order.j.data.total_amount, order.j.data.total_currency)
      process.exit(0)
    }
    const err = order.j.errors?.[0]
    console.log('   -', offer.id.slice(0, 18), order.status, err?.code, '-', (err?.message || '').slice(0, 60))
    if (err?.code !== 'offer_no_longer_available') { process.exit(2) }
  }
  console.log('  All candidate offers expired (transient airline availability in test env).')
  process.exit(4)
}
main().catch(e => { console.error('CRASH', e); process.exit(3) })
