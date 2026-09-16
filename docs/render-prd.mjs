import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'

const src = process.env.SRC
const out = process.env.OUT
const label = process.env.LABEL || 'Portfolio PRD — Md. Jahid Hasan Raihan'

const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' })
await page.emulateMedia({ media: 'print' })
await page.waitForTimeout(600)

await page.pdf({
  path: out,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="width:100%;font-size:7.5pt;color:#8a8f99;
                font-family:'Segoe UI',Arial,sans-serif;
                padding:0 16mm;display:flex;justify-content:space-between;">
      <span>${label}</span>
      <span class="pageNumber"></span>
    </div>`,
  margin: { top: '14mm', bottom: '16mm', left: '0', right: '0' },
})

await browser.close()
console.log('PDF written:', out)
