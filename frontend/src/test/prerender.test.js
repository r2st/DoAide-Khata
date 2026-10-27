import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { withRoute } from '../../scripts/prerender-routes.mjs'
import { ROUTE_META } from '../routeMeta'

const SHELL = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8')
const SERVE = JSON.parse(readFileSync(resolve(__dirname, '../../public/serve.json'), 'utf-8'))

describe('withRoute against the real index.html', () => {
  const meta = ROUTE_META['/summary']
  const html = withRoute(SHELL, meta)
  const url = 'https://khata.doaide.com/summary'

  it('points the title, canonical and og:url at the route', () => {
    expect(html).toContain(`<title>${meta.title.replace('&', '&amp;')}</title>`)
    expect(html).toContain(`<link rel="canonical" href="${url}"`)
    expect(html).toContain(`<meta property="og:url" content="${url}"`)
    expect(html).not.toContain('href="https://khata.doaide.com/"')
  })

  it('adds a removable JSON-LD and an h1 without the site suffix', () => {
    expect(html).toContain('<script type="application/ld+json" data-prerender>')
    expect(html).toContain('<h1>Daily Summary &amp; Profit-Loss</h1>')
  })

  it('escapes markup in the description', () => {
    const out = withRoute(SHELL, { title: 'A <b> | DoAide Khata', description: 'x "y" & z', path: '/x' })
    expect(out).toContain('<h1>A &lt;b&gt;</h1>')
    expect(out).toContain('content="x &quot;y&quot; &amp; z"')
  })
})

describe('ROUTE_META and serve.json', () => {
  it('routes every app path to its own prerendered file', () => {
    for (const path of Object.keys(ROUTE_META).filter((p) => p !== '/')) {
      const rule = SERVE.rewrites.find((r) => r.source === path)
      expect(rule?.destination).toBe(`${path}/index.html`)
    }
  })

  it('keeps private customer ledgers on the bare shell', () => {
    expect(SERVE.rewrites.find((r) => r.source === '/customer/:id').destination).toBe('/app-shell.html')
  })
})
