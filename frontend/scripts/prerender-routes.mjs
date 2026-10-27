// Post-build step: writes dist/<route>/index.html for every app route in
// src/routeMeta.js, with that route's title, description, canonical and a
// WebApplication JSON-LD in the static head, plus an h1 in #root. Without it
// every route served the homepage shell, canonical "/" included, so Google
// folded them all into the homepage. public/serve.json routes each URL to its
// own file. Once React mounts, createRoot replaces #root, Helmet sets the
// tags, and main.jsx drops the data-prerender JSON-LD so Helmet's is the only one.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTE_META } from '../src/routeMeta.js'

const SITE = 'https://khata.doaide.com'
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function setMeta(html, attr, key, value) {
  const tag = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`)
  if (!tag.test(html)) throw new Error(`index.html has no <meta ${attr}="${key}">`)
  return html.replace(tag, (_, open, close) => `${open}${esc(value)}${close}`)
}

export function withRoute(shell, { title, description, path }) {
  const url = `${SITE}${path}`
  const heading = title.replace(/\s*[|—]\s*DoAide Khata.*$/, '')
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: heading,
    url,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any (web browser)',
    inLanguage: ['en-IN', 'hi-IN'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
  }
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  const script = `<script type="application/ld+json" data-prerender>${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
  html = html.replace('</head>', `    ${script}\n  </head>`)
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><main><h1>${esc(heading)}</h1><p>${esc(description)}</p></main></div>`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const shell = readFileSync(join(dist, 'index.html'), 'utf-8')
  // Customer ledgers are private and per-device, so they get the bare shell
  // rather than the homepage's heading.
  writeFileSync(join(dist, 'app-shell.html'), shell)
  for (const meta of Object.values(ROUTE_META)) {
    const file = meta.path === '/' ? join(dist, 'index.html') : join(dist, meta.path, 'index.html')
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, withRoute(shell, meta))
  }
  console.log(`prerendered ${Object.keys(ROUTE_META).length} route heads`)
}
