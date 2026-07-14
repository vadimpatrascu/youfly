// Probe the real Duffel test seat-map API to learn the exact response shape.
const TOKEN = process.env.DUFFEL_TEST_TOKEN
const H = { Authorization: `Bearer ${TOKEN}`, 'Duffel-Version': 'v2', 'Content-Type': 'application/json', Accept: 'application/json' }
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
  const orq = await api('/air/offer_requests?return_offers=true', 'POST', {
    data: { slices: [{ origin: 'LHR', destination: 'JFK', departure_date: dep }], passengers: [{ type: 'adult' }], cabin_class: 'economy' },
  })
  const offers = orq.j.data?.offers || []
  const isDuffel = o => /duffel/i.test(o.owner?.name || '')
  const offer = offers.find(isDuffel) || offers[0]
  console.log('offer', offer?.id, offer?.owner?.name, 'pax', offer?.passengers?.[0]?.id)
  const sm = await api(`/air/seat_maps?offer_id=${offer.id}`)
  console.log('seat_maps status', sm.status)
  const maps = sm.j.data || []
  console.log('maps count', maps.length)
  if (!maps.length) { console.log(JSON.stringify(sm.j).slice(0, 400)); return }
  const m = maps[0]
  console.log('map keys', Object.keys(m))
  console.log('segment_id', m.segment_id, 'slice_id', m.slice_id, 'cabins', m.cabins?.length)
  const cab = m.cabins[0]
  console.log('cabin keys', Object.keys(cab), 'class', cab.cabin_class, 'deck', cab.deck, 'aisles', cab.aisles, 'rows', cab.rows?.length)
  console.log('wings', JSON.stringify(cab.wings))
  // dump first 2 rows structure
  for (const [ri, row] of cab.rows.slice(0, 3).entries()) {
    const els = row.sections.flatMap(s => s.elements)
    console.log(`row${ri} elements:`, els.map(e => e.type + (e.designator ? `:${e.designator}` : '') + (e.available_services?.length ? `($${e.available_services[0].total_amount} svc=${e.available_services[0].id.slice(0,10)})` : e.type === 'seat' ? '(NA)' : '')).join(' '))
  }
  // one full seat element sample
  const seatEl = cab.rows.flatMap(r => r.sections.flatMap(s => s.elements)).find(e => e.type === 'seat' && e.available_services?.length)
  console.log('SAMPLE SEAT:', JSON.stringify(seatEl).slice(0, 500))
}
main().catch(e => { console.error('CRASH', e); process.exit(1) })
