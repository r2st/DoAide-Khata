import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Seo from './components/Seo'
import { LangProvider, useT } from './lib/i18n'
import Bill from './pages/Bill'
import CustomerLedger from './pages/CustomerLedger'
import Help from './pages/Help'
import Home from './pages/Home'
import Settings from './pages/Settings'
import { KhataProvider } from './state/KhataContext'

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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <LangProvider>
        <KhataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </KhataProvider>
      </LangProvider>
    </HelmetProvider>
  )
}
