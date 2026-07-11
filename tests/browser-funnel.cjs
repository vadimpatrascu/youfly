// Headless-browser test of the full booking funnel using the system Chrome.
// Home -> search -> results -> select flight -> passengers -> seats -> payment.
const puppeteer = require('puppeteer-core')
const fs = require('fs')

const BASE = 'http://127.0.0.1:3100'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SHOTS = __dirname + '\\..\\test-screens'

let pass = 0, fail = 0
const failures = []
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log(`  ok - ${name}`) }
  else { fail++; failures.push(name); console.log(`  FAIL - ${name}${extra ? ' :: ' + extra : ''}`) }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function clickByText(page, selector, text) {
  return page.evaluate((sel, txt) => {
    const els = [...document.querySelectorAll(sel)]
    const el = els.find(e => (e.textContent || '').toLowerCase().includes(txt.toLowerCase()))
    if (el) { el.click(); return true }
    return false
  }, selector, text)
}

async function setInput(page, selector, value) {
  return page.evaluate((sel, val) => {
    const el = document.querySelector(sel)
    if (!el) return false
    el.value = val
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, selector, value)
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-first-run', '--disable-gpu', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  })
  const page = await browser.newPage()
  const jsErrors = []
  page.on('pageerror', (e) => jsErrors.push(String(e?.message || e)))
  page.on('console', (m) => { if (m.type() === 'error') jsErrors.push('console: ' + m.text()) })
  // Force the Romanian locale (default audience); headless Chrome is en-US
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ro-RO,ro;q=0.9' })
  await page.setCookie({ name: 'youfly_locale', value: 'ro', url: BASE })

  console.log('== 1. Home page ==')
  // domcontentloaded + hydration wait: networkidle is unreliable here (SW + images),
  // and goto can flake with "frame was detached" — retry once.
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 })
      break
    } catch (e) {
      if (attempt >= 2) throw e
      console.log('  (goto flaked, retrying: ' + String(e.message).slice(0, 60) + ')')
      await sleep(1500)
    }
  }
  await page.waitForSelector('[id^="airport-input"]', { timeout: 20000 })
  await sleep(1200) // let hydration settle
  check('home renders hero', await page.evaluate(() => document.body.innerText.includes('zborul') || document.body.innerText.includes('flight')))
  check('origin prefilled RMO', await page.evaluate(() => {
    const inp = document.querySelector('[id^="airport-input"]')
    return inp && inp.value.includes('RMO')
  }))
  await page.screenshot({ path: SHOTS + '\\1-home.png' })

  console.log('== 2. Fill search ==')
  const destSel = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('[id^="airport-input"]')]
    return inputs[1] ? '#' + CSS.escape(inputs[1].id) : null
  })
  check('destination input exists', !!destSel)
  await page.click(destSel)
  await page.type(destSel, 'buch', { delay: 60 })
  await page.waitForFunction(() => {
    const opts = [...document.querySelectorAll('[role="option"]')]
    return opts.some(o => o.textContent.includes('OTP') || o.textContent.includes('Bucharest'))
  }, { timeout: 8000 }).catch(() => {})
  const picked = await clickByText(page, '[role="option"]', 'OTP') || await clickByText(page, '[role="option"]', 'Bucharest')
  check('destination option picked', picked)
  check('quick date chip clicked', await clickByText(page, 'button', '+1'))
  await sleep(300)
  await page.screenshot({ path: SHOTS + '\\2-search-filled.png' })

  console.log('== 3. Search -> results ==')
  check('search submitted', await clickByText(page, 'button', 'Caută zboruri') || await clickByText(page, 'button', 'Search flights'))
  const navigated = await page.waitForFunction(() => location.pathname === '/search', { timeout: 20000 }).then(() => true).catch(() => false)
  if (!navigated) {
    const dbg = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Caută zboruri') || b.textContent.includes('Search flights'))
      const inputs = [...document.querySelectorAll('[id^="airport-input"]')].map(i => i.value)
      const dep = document.querySelector('#search-departure')
      const alerts = [...document.querySelectorAll('[role="alert"]')].map(a => a.textContent.trim())
      return { path: location.pathname, btnDisabled: btn ? btn.disabled : 'no-btn', inputs, depDate: dep ? dep.value : 'none', alerts }
    })
    console.log('  DEBUG:', JSON.stringify(dbg))
    console.log('  JS errors so far:', JSON.stringify(jsErrors.slice(-5)))
    await page.screenshot({ path: SHOTS + '\\3-debug.png' })
    check('navigated to /search', false, JSON.stringify(dbg))
    await browser.close(); process.exit(1)
  }
  await page.waitForFunction(() => document.body.innerText.includes('Selectează') || document.body.innerText.includes('Select'), { timeout: 20000 })
  check('offers rendered', await page.evaluate(() =>
    [...document.querySelectorAll('button')].filter(b => b.textContent.includes('Selectează') || b.textContent.includes('Select')).length >= 3))
  check('mock airline shown', await page.evaluate(() => document.body.innerText.includes('Duffel Airways')))
  await page.screenshot({ path: SHOTS + '\\3-results.png' })

  console.log('== 4. Select flight -> passenger form ==')
  await clickByText(page, 'button', 'Selectează') || await clickByText(page, 'button', 'Select')
  await page.waitForFunction(() => location.pathname === '/ticket-order', { timeout: 15000 })
  await page.waitForSelector('#pax-0-given-name', { timeout: 15000 })
  check('passenger form shown', true)
  await page.type('#pax-0-given-name', 'Vadim')
  await page.type('#pax-0-family-name', 'Patrascu')
  check('dob set', await setInput(page, '#pax-0-born-on', '1990-05-10'))
  await page.type('#pax-0-email', 'vadim@example.com')
  await page.type('#pax-0-phone', '+37360123456')
  await page.screenshot({ path: SHOTS + '\\4-passengers.png' })
  check('continue clicked', await clickByText(page, 'button[type="submit"]', 'Continu'))

  console.log('== 5. Seat selection ==')
  await page.waitForFunction(() => location.pathname === '/seat-selection', { timeout: 15000 })
  await sleep(600)
  await page.screenshot({ path: SHOTS + '\\5-seats.png' })
  const seatContinue = await clickByText(page, 'button', 'Continu')
    || await clickByText(page, 'button', 'plat')
    || await clickByText(page, 'button', 'payment')
    || await clickByText(page, 'button', 'Sari')
    || await clickByText(page, 'button', 'Skip')
    || await clickByText(page, 'a', 'plat')
  check('seat page continue', seatContinue)

  console.log('== 6. Payment page ==')
  await page.waitForFunction(() => location.pathname === '/payment', { timeout: 15000 })
  await page.waitForFunction(() => document.body.innerText.includes('113,29') || document.body.innerText.includes('113.29'), { timeout: 15000 })
    .then(() => check('exact grossed charge (113.29) displayed', true))
    .catch(async () => check('exact grossed charge (113.29) displayed', false, (await page.evaluate(() => document.body.innerText.slice(0, 400)))))
  check('processing fee line shown', await page.evaluate(() => document.body.innerText.includes('Comision') || document.body.innerText.toLowerCase().includes('fee')))
  check('countdown/reservation banner', await page.evaluate(() => /\d+:\d\d/.test(document.body.innerText)))
  // The Duffel component script comes from assets.duffel.com (real CDN);
  // with a mock token it can't complete payment, but it must load & attempt render.
  const componentState = await page.waitForFunction(() => {
    const el = document.querySelector('duffel-payments')
    if (!el) return 'missing'
    if (el.children.length > 0 || el.shadowRoot) return 'rendered'
    return false
  }, { timeout: 20000 }).then(h => h.jsonValue()).catch(() => 'timeout')
  check('duffel-payments component present & rendering', componentState === 'rendered', `state=${componentState}`)
  await sleep(1500)
  await page.screenshot({ path: SHOTS + '\\6-payment.png' })

  console.log('== 7. JS error scan across funnel ==')
  const realErrors = jsErrors.filter(e =>
    !e.includes('stripe') && !e.includes('Stripe') && !e.includes('pk_test_mock') &&
    !e.includes('assets.duffel.com') && !e.includes('ERR_BLOCKED_BY_CLIENT') &&
    !e.includes('googletagmanager') && !e.includes('unsplash') && !e.includes('gstatic'))
  check('no unexpected JS errors', realErrors.length === 0, realErrors.slice(0, 5).join(' | '))

  console.log(`\n==== BROWSER FUNNEL RESULT: ${pass} passed, ${fail} failed ====`)
  if (failures.length) failures.forEach(f => console.log('  - ' + f))
  await browser.close()
  process.exit(fail ? 1 : 0)
}

main().catch(e => { console.error('FUNNEL CRASHED:', e); process.exit(2) })
