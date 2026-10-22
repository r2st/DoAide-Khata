import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Balance from '../components/Balance'
import CustomerForm from '../components/CustomerForm'
import Modal from '../components/Modal'
import QuickEntry from '../components/QuickEntry'
import Seo, { webAppLd } from '../components/Seo'
import { formatDate, formatINR, initials, todayISO } from '../lib/format'
import { useT } from '../lib/i18n'
import { customerBalances, dashboard, lastActivity, live } from '../lib/ledger'
import { useKhata } from '../state/KhataContext'

function Stat({ label, value, tone }) {
  return (
    <div className="card p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{formatINR(value)}</p>
    </div>
  )
}

export default function Home() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const { state, addCustomer } = useKhata()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  const today = todayISO()
  const stats = useMemo(() => dashboard(state, today), [state, today])
  const balances = useMemo(() => customerBalances(state.transactions), [state.transactions])
  const activity = useMemo(() => lastActivity(state.transactions), [state.transactions])

  const customers = useMemo(() => {
    const q = query.trim().toLowerCase()
    const digits = q.replace(/\D/g, '')
    return live(state.customers)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || (digits && (c.phone || '').replace(/\D/g, '').includes(digits)))
      .sort((a, b) => (activity[b.id] || '').localeCompare(activity[a.id] || '') || b.createdAt - a.createdAt)
  }, [state.customers, query, activity])

  function saveCustomer(data) {
    const customer = addCustomer(data)
    setAdding(false)
    navigate(`/customer/${customer.id}`)
  }

  return (
    <>
      <Seo
        title="DoAide Khata — Free Digital Udhar Khata App for Shopkeepers | डिजिटल खाता"
        description="Free digital udhar khata for Indian shopkeepers. Track who owes you, send WhatsApp payment reminders with UPI links, make GST bills, export PDF. Hindi + English, no login needed."
        path="/"
        jsonLd={[webAppLd]}
      />
      <h1 className="sr-only">DoAide Khata — {t('tagline')}</h1>

      <section className="grid grid-cols-2 gap-3" aria-label="Dashboard">
        <div className="card col-span-2 flex items-center justify-between bg-gradient-to-br from-khata to-khata-dark text-white">
          <div>
            <p className="text-sm text-emerald-100">{t('dash.toCollect')}</p>
            <p className="text-3xl font-bold" data-testid="total-outstanding">
              {formatINR(stats.totalOutstanding)}
            </p>
          </div>
          {stats.totalAdvance > 0 && (
            <div className="text-right">
              <p className="text-xs text-emerald-100">{t('dash.advance')}</p>
              <p className="text-lg font-semibold">{formatINR(stats.totalAdvance)}</p>
            </div>
          )}
        </div>
        <Stat label={t('dash.todayCollection')} value={stats.todayCollection} tone="text-khata" />
        <Stat label={t('dash.todayGiven')} value={stats.todayGiven} tone="text-red-600" />
      </section>

      <div className="mt-4">
        <QuickEntry />
      </div>

      {stats.topDebtors.length > 0 && (
        <section className="card mt-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-600">{t('dash.topDebtors')}</h2>
          <ol className="space-y-1">
            {stats.topDebtors.map((c, i) => (
              <li key={c.id}>
                <Link to={`/customer/${c.id}`} className="flex items-center justify-between rounded-lg px-1 py-1.5 hover:bg-gray-50">
                  <span className="truncate">
                    <span className="mr-2 text-gray-400">{i + 1}.</span>
                    {c.name}
                  </span>
                  <span className="font-semibold text-red-600">{formatINR(c.balance)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {stats.overdue.length > 0 && (
        <section className="card mt-4 border-l-4 border-amber-400">
          <h2 className="mb-2 text-sm font-semibold text-amber-700">⏰ {t('dash.overdue')}</h2>
          <ul className="space-y-1 text-sm">
            {stats.overdue.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to={`/customer/${c.id}`} className="flex justify-between py-1">
                  <span className="truncate">{c.name}</span>
                  <span className="text-gray-500">
                    {formatINR(c.balance)} · {t('dash.days', { n: c.days })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('customers.title', { n: stats.customerCount })}</h2>
          <button type="button" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex" onClick={() => setAdding(true)}>
            + {t('customers.add')}
          </button>
        </div>
        {stats.customerCount > 0 && (
          <input
            type="search"
            className="input mb-3"
            placeholder={t('customers.search')}
            aria-label={t('customers.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
        {stats.customerCount === 0 ? (
          <div className="card text-center text-gray-600">
            <p className="mb-4">{t('customers.empty')}</p>
            <button type="button" className="btn-primary" onClick={() => setAdding(true)}>
              + {t('customers.add')}
            </button>
          </div>
        ) : customers.length === 0 ? (
          <p className="py-6 text-center text-gray-500">{t('customers.noMatch')}</p>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            {customers.map((c) => (
              <li key={c.id}>
                <Link to={`/customer/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-khata-dark">
                    {initials(c.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{c.name}</span>
                    <span className="block text-xs text-gray-500">{activity[c.id] ? formatDate(activity[c.id], lang) : c.phone}</span>
                  </span>
                  <Balance value={balances[c.id] || 0} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="no-print fixed bottom-20 right-4 z-20 flex items-center gap-2 rounded-full bg-khata px-5 py-3.5 font-semibold text-white shadow-lg sm:hidden"
      >
        + {t('customers.add')}
      </button>

      {adding && (
        <Modal title={t('customers.add')} onClose={() => setAdding(false)}>
          <CustomerForm onSubmit={saveCustomer} onCancel={() => setAdding(false)} />
        </Modal>
      )}
    </>
  )
}
