import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from './lib/registerSW'

// The build bakes a JSON-LD into each route's HTML for crawlers that skip
// JavaScript (scripts/prerender-routes.mjs). Helmet adds the page's own, so
// drop the static one rather than ship two.
document.querySelectorAll('script[data-prerender]').forEach((s) => s.remove())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerSW()
