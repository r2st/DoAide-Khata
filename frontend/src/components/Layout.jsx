import { Link, NavLink, Outlet } from 'react-router-dom'
import { useT } from '../lib/i18n'
import { useKhata } from '../state/KhataContext'

const NAV = [
  { to: '/', key: 'nav.khata', icon: '📒', end: true },
  { to: '/bill', key: 'nav.bill', icon: '🧾' },
  { to: '/settings', key: 'nav.settings', icon: '⚙️' },
  { to: '/help', key: 'nav.help', icon: '❓' },
]

export function LangToggle({ className = '' }) {
  const { t, lang, setLang } = useT()
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
      className={`rounded-full border border-white/40 px-3 py-1 text-sm font-semibold ${className}`}
    >
      {t('switchLang')}
    </button>
  )
}

export default function Layout() {
  const { t } = useT()
  const { auth, sync } = useKhata()

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="no-print sticky top-0 z-30 bg-khata-dark text-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">₹</span>
            <span className="leading-tight">
              <span className="block text-lg font-bold">{t('appName')}</span>
              <span className="block text-xs text-emerald-200">{t('tagline')}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {auth && (
              <span
                title={sync.status === 'error' ? t('sync.error') : auth.email}
                className={`h-2.5 w-2.5 rounded-full ${sync.status === 'error' ? 'bg-amber-400' : 'bg-emerald-300'}`}
              />
            )}
            <LangToggle />
          </div>
        </div>
        <nav className="hidden border-t border-white/10 px-2 sm:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `px-4 py-2 text-sm font-medium ${isActive ? 'border-b-2 border-white' : 'text-emerald-100'}`}
            >
              {t(n.key)}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4 sm:pb-8">
        <Outlet />
      </main>

      <footer className="no-print px-4 pb-24 text-center text-xs text-gray-500 sm:pb-6">
        {!auth && <p className="mb-2">{t('localNote')}</p>}
        <a
          href="https://doaide.com"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-khata-dark shadow-sm ring-1 ring-black/5"
        >
          <span className="h-2 w-2 rounded-full bg-khata-light" />
          {t('badge')}
        </a>
      </footer>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-4">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${isActive ? 'text-khata' : 'text-gray-500'}`
              }
            >
              <span className="text-xl" aria-hidden>
                {n.icon}
              </span>
              {t(n.key)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
