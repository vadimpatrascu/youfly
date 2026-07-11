// End-to-end integration test: drives the built site's HTTP API the same
// way the browser does, against the mock Duffel API.
const BASE = process.env.BASE || 'http://127.0.0.1:3100'
const MOCK = 'http://127.0.0.1:4545'

let pass = 0, fail = 0
const failures = []
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok - ${name}`) }
  else { fail++; failures.push(name + (extra ? ` :: ${extra}` : '')); console.log(`  FAIL - ${name}${extra ? ' :: ' + extra : ''}`) }
}

// Distinct client IP per test section — the per-IP rate limiter (5 bookings/min)
// otherwise correctly blocks the later sections of this rapid-fire suite.
// (Local server trusts X-Forwarded-For; on Vercel the platform overwrites it.)
let clientIp = '203.0.113.1'
function setClientIp(ip) { clientIp = ip }

async function req(method, path, body, base = BASE) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'X-Forwarded-For': clientIp,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, text, json }
}

function gross(net, rate = 0.029) {
  return (Math.ceil((parseFloat(net) / (1 - rate)) * 100) / 100).toFixed(2)
}

const paxForOffer = (offer, count = 2) => offer.passengers.slice(0, count).map((p, i) => ({
  duffelPassengerId: p.id,
  type: p.type,
  title: 'mr',
  gender: 'm',
  given_name: i === 0 ? 'Vadim' : 'Ana',
  family_name: 'Patrascu',
  born_on: '1990-05-10',
  email: i === 0 ? 'vadim@example.com' : undefined,
  phone: i === 0 ? '+37360123456' : undefined,
}))

async function main() {
  console.log('== A. Pages render (SSR) ==')
  const pages = ['/', '/deals', '/faq', '/about', '/blog', '/blog/cum-sa-gasesti-bilete-ieftine',
    '/destinations', '/airports', '/visa', '/checkin', '/luggage', '/flight-status',
    '/my-booking', '/contact', '/terms', '/privacy']
  for (const p of pages) {
    const r = await req('GET', p)
    check(`GET ${p} -> 200`, r.status === 200, `got ${r.status}`)
    check(`GET ${p} has app markup`, r.text.includes('id="__nuxt"') || r.text.includes("id='__nuxt'"), 'no #__nuxt')
  }
  const nf = await req('GET', '/definitely-not-a-page-xyz')
  check('unknown page -> 404', nf.status === 404, `got ${nf.status}`)
  for (const p of ['/sitemap.xml', '/robots.txt', '/manifest.json', '/api/og?from=RMO&to=OTP&price=35']) {
    const r = await req('GET', p)
    check(`GET ${p} -> 200`, r.status === 200, `got ${r.status}`)
  }

  console.log('== B. Service endpoints ==')
  const health = await req('GET', '/api/health')
  check('health duffel ok', health.json?.services?.duffel === 'ok', JSON.stringify(health.json))
  const fx = await req('GET', '/api/exchange-rate?pair=EUR-MDL')
  check('exchange rate present', typeof fx.json?.rate === 'number' && fx.json.rate > 10, JSON.stringify(fx.json))
  console.log(`     (rate=${fx.json?.rate} source=${fx.json?.source})`)
  const prices = await req('GET', '/api/prices')
  check('prices endpoint', prices.status === 200 && prices.json && Object.keys(prices.json).length > 3)
  const air = await req('GET', '/api/airports?q=buch')
  check('airport autocomplete via Duffel', Array.isArray(air.json) && air.json.some(a => a.airport_iata === 'OTP'), JSON.stringify(air.json)?.slice(0, 120))

  console.log('== C. Input validation ==')
  check('search invalid IATA -> 400', (await req('POST', '/api/search', { origin: 'X!', destination: 'OTP', departureDate: '2026-12-01' })).status === 400)
  check('search past date -> 400', (await req('POST', '/api/search', { origin: 'RMO', destination: 'OTP', departureDate: '2020-01-01' })).status === 400)
  check('search Feb 30 -> 400', (await req('POST', '/api/search', { origin: 'RMO', destination: 'OTP', departureDate: '2026-02-30' })).status === 400)
  check('book without payment -> 402', (await req('POST', '/api/book', { offerId: 'off_x', passengers: [{}] })).status === 402)
  check('booking lookup bad ref -> 400', (await req('GET', '/api/booking/ab')).status === 400)

  console.log('== D. Search -> offers ==')
  const search = await req('POST', '/api/search', {
    origin: 'RMO', destination: 'OTP', departureDate: '2026-12-01',
    adults: 2, children: 0, infants: 0, cabinClass: 'economy',
  })
  check('search 200', search.status === 200, `got ${search.status} ${search.text.slice(0, 200)}`)
  const offers = search.json?.offers || []
  check('offers returned', offers.length === 3, `got ${offers.length}`)
  const offer = offers[0]
  check('offer mapped shape', !!(offer?.id && offer.total_amount && offer.slices?.[0]?.segments?.[0]?.carrier_name))
  check('offers sorted stably / no raw leak', !search.text.includes('SHOULD_NOT_LEAK'), 'private fare data leaked!')
  check('offer has 2 passengers', offer.passengers?.length === 2, `got ${offer?.passengers?.length}`)

  console.log('== E. Offer refetch endpoint ==')
  const refetch = await req('GET', `/api/offer/${offer.id}`)
  check('offer refetch 200', refetch.status === 200)
  check('offer refetch no raw Duffel internals', !refetch.text.includes('SHOULD_NOT_LEAK') && !refetch.text.includes('private_fares'), 'leaks raw offer')
  check('offer refetch keeps passengers+expiry', refetch.json?.passengers?.length === 2 && !!refetch.json?.expires_at)

  console.log('== F. Payment intent ==')
  const intent = await req('POST', '/api/payment/intent', { offerId: offer.id })
  check('intent created', intent.status === 200 && intent.json?.paymentIntentId?.startsWith('pit_'), intent.text.slice(0, 200))
  check('intent amount = grossed-up total', intent.json?.amount === gross(offer.total_amount), `expected ${gross(offer.total_amount)} got ${intent.json?.amount}`)
  check('intent returns client token', !!intent.json?.clientToken)

  console.log('== G. Booking blocked until paid ==')
  const early = await req('POST', '/api/book', { offerId: offer.id, passengers: paxForOffer(offer), paymentIntentId: intent.json.paymentIntentId })
  check('book with unpaid intent -> 402', early.status === 402, `got ${early.status} ${early.text.slice(0, 120)}`)

  console.log('== H. Pay (simulated card) then book — 2 passengers, lead-only contact ==')
  await req('POST', `/_mock/pay/${intent.json.paymentIntentId}`, null, MOCK)
  const book = await req('POST', '/api/book', { offerId: offer.id, passengers: paxForOffer(offer), paymentIntentId: intent.json.paymentIntentId })
  check('booking succeeds', book.status === 200, `got ${book.status} ${book.text.slice(0, 200)}`)
  check('booking returns reference', /^YF/.test(book.json?.reference || ''), book.text.slice(0, 120))
  const mockState1 = (await req('GET', '/_mock/state', null, MOCK)).json
  check('exactly 1 order at Duffel', mockState1.orders === 1, JSON.stringify(mockState1))
  check('payment intent confirmed', mockState1.intents.find(i => i.id === intent.json.paymentIntentId)?.status === 'succeeded')

  console.log('== I. Double-spend protection ==')
  const offer2 = offers[1]
  const reuse = await req('POST', '/api/book', { offerId: offer2.id, passengers: paxForOffer(offer2), paymentIntentId: intent.json.paymentIntentId })
  check('reusing paid intent -> 409', reuse.status === 409, `got ${reuse.status} ${reuse.text.slice(0, 120)}`)

  console.log('== J. Amount-mismatch protection ==')
  const cheapIntent = await req('POST', '/api/payment/intent', { offerId: offer.id }) // priced for offer[0]
  await req('POST', `/_mock/pay/${cheapIntent.json.paymentIntentId}`, null, MOCK)
  const expensive = offers[2] // costs more than offer[0]
  const mismatch = await req('POST', '/api/book', { offerId: expensive.id, passengers: paxForOffer(expensive), paymentIntentId: cheapIntent.json.paymentIntentId })
  check('cheaper intent on pricier offer -> 409', mismatch.status === 409, `got ${mismatch.status} ${mismatch.text.slice(0, 120)}`)

  console.log('== K. Auto-refund when issuance fails after charge ==')
  setClientIp('203.0.113.50')
  const intent3 = await req('POST', '/api/payment/intent', { offerId: offer2.id })
  await req('POST', `/_mock/pay/${intent3.json.paymentIntentId}`, null, MOCK)
  await req('POST', '/_mock/fail-next-order', null, MOCK)
  const failedBook = await req('POST', '/api/book', { offerId: offer2.id, passengers: paxForOffer(offer2), paymentIntentId: intent3.json.paymentIntentId })
  check('failed issuance -> 502 booking_failed_refund', failedBook.status === 502 && failedBook.text.includes('booking_failed_refund'), `got ${failedBook.status} ${failedBook.text.slice(0, 160)}`)
  const mockState2 = (await req('GET', '/_mock/state', null, MOCK)).json
  check('customer was refunded', mockState2.refunds.includes(intent3.json.paymentIntentId), JSON.stringify(mockState2.refunds))

  console.log('== L. Retry after refund works with a fresh payment ==')
  setClientIp('203.0.113.51')
  const intent4 = await req('POST', '/api/payment/intent', { offerId: offer2.id })
  await req('POST', `/_mock/pay/${intent4.json.paymentIntentId}`, null, MOCK)
  const retryBook = await req('POST', '/api/book', { offerId: offer2.id, passengers: paxForOffer(offer2), paymentIntentId: intent4.json.paymentIntentId })
  check('retry booking succeeds', retryBook.status === 200 && /^YF/.test(retryBook.json?.reference || ''), `got ${retryBook.status}`)

  console.log('== M. Rate limiter blocks the 6th rapid booking attempt ==')
  setClientIp('203.0.113.99')
  let lastStatus = 0
  for (let i = 0; i < 6; i++) {
    lastStatus = (await req('POST', '/api/book', { offerId: 'off_none', passengers: [], paymentIntentId: 'pit_none1' })).status
  }
  check('6th booking attempt from one IP -> 429', lastStatus === 429, `got ${lastStatus}`)

  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`)
  if (failures.length) { console.log('Failures:'); failures.forEach(f => console.log('  - ' + f)) }
  process.exit(fail ? 1 : 0)
}

main().catch((e) => { console.error('E2E crashed:', e); process.exit(2) })
