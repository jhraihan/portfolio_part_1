import { chromium } from 'playwright'
const OUT = process.env.OUT
const SITE = 'https://portfolio-web-asu3.onrender.com'
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const p = await c.newPage()
const errs = []
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message))
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()) })

console.log('loading home (backend may be waking, allow ~60s)...')
await p.goto(SITE, { waitUntil: 'networkidle', timeout: 120000 })
await p.waitForTimeout(6000)

const home = await p.evaluate(() => ({
  name: document.querySelector('h1')?.textContent?.trim().slice(0, 40) ?? '(none)',
  cards: document.querySelectorAll('article').length,
  photo: !!document.querySelector('img[alt*="Jahid"]'),
  resume: /resume/i.test(document.body.innerText),
}))
console.log('HOME:', JSON.stringify(home))
await p.screenshot({ path: `${OUT}/live-home.png` })

await p.goto(SITE + '/projects/micromart', { waitUntil: 'networkidle', timeout: 120000 })
await p.waitForTimeout(4000)
for (let y = 0; y < 7000; y += 600) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(200) }
await p.waitForTimeout(2000)
const cs = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')]
  return {
    title: document.querySelector('h1')?.textContent?.trim(),
    sections: document.querySelectorAll('h2').length,
    images: imgs.length,
    broken: imgs.filter(i => !i.complete || i.naturalWidth === 0).length,
  }
})
console.log('CASE STUDY:', JSON.stringify(cs))
await p.evaluate(() => window.scrollTo(0, 0))
await p.waitForTimeout(800)
await p.screenshot({ path: `${OUT}/live-case.png` })

console.log('errors:', errs.length ? errs.slice(0, 4).join('\n') : 'none')
await b.close()
