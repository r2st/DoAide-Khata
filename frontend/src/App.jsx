import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Seo from './components/Seo'
import { LangProvider, useT } from './lib/i18n'
import { lazyPage } from './lib/lazyPage'
import Home from './pages/Home'
import { KhataProvider } from './state/KhataContext'

// Home is the landing page and stays in the main bundle; the rest load on demand.
const CustomerLedger = lazyPage(() => import('./pages/CustomerLedger'))
const Bill = lazyPage(() => import('./pages/Bill'))
const Settings = lazyPage(() => import('./pages/Settings'))
const Help = lazyPage(() => import('./pages/Help'))
const ReminderTool = lazyPage(() => import('./pages/ReminderTool'))

export const PAGES = [CustomerLedger, Bill, Settings, Help, ReminderTool]
export const preloadPages = () => Promise.all(PAGES.map((p) => p.preload()))

function NotFound() {
  const { t } = useT()
  return (
    <div className="py-16 text-center">
      <Seo title="Page not found — DoAide Khata" description="This page does not exist." path="/404" />
      <h1 className="mb-4 text-xl font-bold">{t('notFound')}</h1>
      <Link to="/" className="btn-primary">
        {t('goHome')}
      </Link>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="customer/:id" element={<CustomerLedger />} />
        <Route path="bill" element={<Bill />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
        <Route path="tools/whatsapp-reminder" element={<ReminderTool />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  // Fetch the other pages once the first screen is up, so they open instantly and work offline.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500))
    idle(() => preloadPages().catch(() => {}))
  }, [])

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <LangProvider>
          <KhataProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </KhataProvider>
        </LangProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
