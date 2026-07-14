// Minimal mock of the Duffel API for integration testing.
// Implements the endpoints youfly uses, with response shapes from Duffel docs.
const http = require('http')

const state = {
  offers: new Map(),
  intents: new Map(),
  orders: [],
  refunds: [],
  services: new Map(), // serviceId -> { amount, currency }
  seatMaps: new Map(), // offerId -> seat map (built on demand)
  failNextOrder: false,
  seq: 0,
}

// Build a small seat map for an offer and register its seat services.
function seatMapFor(offer) {
  if (state.seatMaps.has(offer.id)) return state.seatMaps.get(offer.id)
  const seg = offer.slices[0].segments[0]
  const cols = ['A', 'B', 'C', 'D']
  const rows = []
  for (let r = 10; r <= 12; r++) {
    const elements = []
    for (const c of cols) {
      const designator = `${r}${c}`
      // Row 11 is fully taken; otherwise A/C available, B/D taken
      const avail = r !== 11 && (c === 'A' || c === 'C')
      const el = { type: 'seat', designator, name: null, disclosures: [] }
      el.available_services = avail
        ? offer.passengers.map((pax, pi) => {
            const id = `ase_${offer.id}_${designator}_${pi}`
            state.services.set(id, { amount: '15.00', currency: offer.total_currency })
            return { id, passenger_id: pax.id, total_amount: '15.00', total_currency: offer.total_currency }
          })
        : []
      elements.push(el)
      if (c === 'B') elements.push({ type: 'empty' }) // aisle gap
    }
    rows.push({ sections: [{ elements }] })
  }
  const map = {
    id: `sea_${offer.id}`,
    slice_id: offer.slices[0].id,
    segment_id: seg.id,
    cabins: [{ cabin_class: 'economy', deck: 0, aisles: 1, wings: { first_row_index: 0, last_row_index: 2 }, rows }],
  }
  state.seatMaps.set(offer.id, map)
  return map
}

function offerFixture(id, passengers, expiresInMs = 20 * 60 * 1000) {
  const dep = new Date(Date.now() + 30 * 86400000)
  const arr = new Date(dep.getTime() + 105 * 60000)
  return {
    id,
    total_amount: '120.00',
    total_currency: 'EUR',
    tax_amount: '20.00',
    base_amount: '100.00',
    expires_at: new Date(Date.now() + expiresInMs).toISOString(),
    passengers: passengers.map((p, i) => ({ id: `pas_${id}_${i}`, type: p.type })),
    owner: { name: 'Duffel Airways', iata_code: 'ZZ' },
    private_fares: [{ secret: 'SHOULD_NOT_LEAK' }],
    slices: [{
      id: `sli_${id}`,
      origin: { iata_code: 'RMO', name: 'Chisinau Intl', city: { name: 'Chisinau' } },
      destination: { iata_code: 'OTP', name: 'Henri Coanda', city: { name: 'Bucharest' } },
      departing_at: dep.toISOString(),
      arriving_at: arr.toISOString(),
      duration: 'PT1H45M',
      segments: [{
        id: `seg_${id}`,
        departing_at: dep.toISOString(),
        arriving_at: arr.toISOString(),
        origin: { iata_code: 'RMO', name: 'Chisinau Intl', city: { name: 'Chisinau' } },
        destination: { iata_code: 'OTP', name: 'Henri Coanda', city: { name: 'Bucharest' } },
        marketing_carrier: { name: 'Duffel Airways', iata_code: 'ZZ' },
        marketing_carrier_flight_number: '123',
        duration: 'PT1H45M',
        aircraft: { name: 'A320', iata_code: '320' },
      }],
    }],
  }
}

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => { data += c })
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) } })
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname
  const auth = req.headers.authorization || ''
  if (!p.startsWith('/_mock') && !auth.startsWith('Bearer ')) {
    return json(res, 401, { errors: [{ title: 'Unauthorized', message: 'Missing token' }] })
  }

  // ── mock controls ──
  if (p.startsWith('/_mock/pay/')) { // simulate the card component collecting payment
    const id = p.split('/').pop()
    const pi = state.intents.get(id)
    if (!pi) return json(res, 404, { error: 'no such intent' })
    pi.status = 'requires_confirmation'
    return json(res, 200, { ok: true })
  }
  if (p === '/_mock/fail-next-order') { state.failNextOrder = true; return json(res, 200, { ok: true }) }
  if (p === '/_mock/state') {
    return json(res, 200, {
      orders: state.orders.length,
      refunds: state.refunds,
      intents: [...state.intents.values()].map(i => ({ id: i.id, status: i.status, amount: i.amount })),
    })
  }

  // ── Duffel API ──
  if (p === '/air/offer_requests' && req.method === 'POST') {
    const body = await readBody(req)
    const pax = body?.data?.passengers || [{ type: 'adult' }]
    const reqId = `orq_${++state.seq}`
    const offers = [1, 2, 3].map((n) => {
      const o = offerFixture(`off_${state.seq}_${n}`, pax)
      o.total_amount = (100 + n * 10).toFixed(2)
      o.base_amount = (80 + n * 10).toFixed(2)
      state.offers.set(o.id, o)
      return o
    })
    return json(res, 200, { data: { id: reqId, offers } })
  }

  const offerMatch = p.match(/^\/air\/offers\/([^/]+)$/)
  if (offerMatch && req.method === 'GET') {
    const o = state.offers.get(offerMatch[1])
    if (!o) return json(res, 404, { errors: [{ title: 'Not found', message: 'Offer not found' }] })
    return json(res, 200, { data: o })
  }

  if (p === '/payments/payment_intents' && req.method === 'POST') {
    const body = await readBody(req)
    const { amount, currency } = body?.data || {}
    const id = `pit_${++state.seq}`
    // Shape matches real Duffel client tokens: base64 JSON with Stripe credentials
    const clientToken = Buffer.from(JSON.stringify({
      client_secret: `pi_3Mock${id}_secret_mock`,
      publishable_key: 'pk_test_mock_not_a_real_key',
    })).toString('base64')
    const pi = { id, live_mode: false, status: 'requires_payment_method', amount, currency, client_token: clientToken, confirmed_at: null }
    state.intents.set(id, pi)
    return json(res, 200, { data: pi })
  }

  const piMatch = p.match(/^\/payments\/payment_intents\/([^/]+)$/)
  if (piMatch && req.method === 'GET') {
    const pi = state.intents.get(piMatch[1])
    if (!pi) return json(res, 404, { errors: [{ title: 'Not found', message: 'No such payment intent' }] })
    return json(res, 200, { data: pi })
  }

  const confirmMatch = p.match(/^\/payments\/payment_intents\/([^/]+)\/actions\/confirm$/)
  if (confirmMatch && req.method === 'POST') {
    const pi = state.intents.get(confirmMatch[1])
    if (!pi) return json(res, 404, { errors: [{ title: 'Not found', message: 'No such payment intent' }] })
    if (pi.status !== 'requires_confirmation') {
      return json(res, 422, { errors: [{ title: 'Invalid state', message: `Cannot confirm from ${pi.status}` }] })
    }
    pi.status = 'succeeded'
    pi.confirmed_at = new Date().toISOString()
    return json(res, 200, { data: pi })
  }

  const refundMatch = p.match(/^\/payments\/payment_intents\/([^/]+)\/actions\/refund$/)
  if (refundMatch && req.method === 'POST') {
    state.refunds.push(refundMatch[1])
    return json(res, 200, { data: { id: refundMatch[1], status: 'refunded' } })
  }

  if (p === '/air/seat_maps' && req.method === 'GET') {
    const offerId = url.searchParams.get('offer_id')
    const offer = state.offers.get(offerId)
    if (!offer) return json(res, 200, { data: [] })
    return json(res, 200, { data: [seatMapFor(offer)] })
  }

  if (p === '/air/orders' && req.method === 'POST') {
    if (state.failNextOrder) {
      state.failNextOrder = false
      return json(res, 500, { errors: [{ title: 'Airline error', message: 'Simulated issuance failure' }] })
    }
    const body = await readBody(req)
    const d = body?.data || {}
    const offer = state.offers.get(d.selected_offers?.[0])
    if (!offer) return json(res, 404, { errors: [{ title: 'Not found', message: 'Offer not found' }] })
    // Contract checks that a real Duffel would enforce:
    const offerPaxIds = new Set(offer.passengers.map(x => x.id))
    for (const pax of d.passengers || []) {
      if (!offerPaxIds.has(pax.id)) return json(res, 422, { errors: [{ title: 'Validation error', message: `Unknown passenger id ${pax.id}` }] })
      if (!pax.email || !pax.phone_number || !pax.given_name || !pax.family_name || !pax.born_on) {
        return json(res, 422, { errors: [{ title: 'Validation error', message: 'Missing passenger contact/identity fields' }] })
      }
    }
    if ((d.passengers || []).length !== offer.passengers.length) {
      return json(res, 422, { errors: [{ title: 'Validation error', message: 'Passenger count mismatch' }] })
    }
    // Validate any seat services and compute the expected order total
    let servicesTotal = 0
    for (const s of d.services || []) {
      const svc = state.services.get(s.id)
      if (!svc) return json(res, 422, { errors: [{ title: 'Validation error', message: `Unknown service ${s.id}` }] })
      servicesTotal += parseFloat(svc.amount)
    }
    const expectedTotal = (parseFloat(offer.total_amount) + servicesTotal).toFixed(2)
    const pay = d.payments?.[0]
    if (!pay || pay.type !== 'balance' || pay.amount !== expectedTotal || pay.currency !== offer.total_currency) {
      return json(res, 422, { errors: [{ title: 'Validation error', message: `Payment must be balance with amount ${expectedTotal}` }] })
    }
    const order = {
      id: `ord_${++state.seq}`,
      booking_reference: `YF${String(state.seq).padStart(4, '0')}`,
      total_amount: expectedTotal,
      total_currency: offer.total_currency,
      services: d.services || [],
      metadata: d.metadata || {},
    }
    state.orders.push(order)
    return json(res, 200, { data: order })
  }

  if (p === '/places/suggestions' && req.method === 'GET') {
    return json(res, 200, {
      data: [{
        type: 'airport', iata_code: 'OTP', iata_country_code: 'RO',
        name: 'Henri Coanda International', city_name: 'Bucharest',
      }],
    })
  }

  json(res, 404, { errors: [{ title: 'Not found', message: `No mock for ${req.method} ${p}` }] })
})

server.listen(4545, '127.0.0.1', () => console.log('MOCK_DUFFEL_READY on 4545'))
