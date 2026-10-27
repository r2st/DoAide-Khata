import { useMemo, useState } from 'react'
import { api, deliverPdf } from '../lib/api'
import Seo from '../components/Seo'
import { ROUTE_META } from '../routeMeta'
import { formatDate, formatINR, todayISO } from '../lib/format'
import { useT } from '../lib/i18n'
import { customerBalances, dailySummary, live } from '../lib/ledger'
import { useKhata } from '../state/KhataContext'

export function monthRange(month) {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` }
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month, lang) {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' })
}

function Total({ label, value, tone }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tone}`}>{formatINR(value)}</p>
    </div>
  )
}

export default function Summary() {
  const { t, lang } = useT()
  const { state } = useKhata()
  const [month, setMonth] = useState(() => todayISO().slice(0, 7))
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfError, setPdfError] = useState('')

  const currentMonth = todayISO().slice(0, 7)
  const { from, to } = monthRange(month)
  const { days, totals } = useMemo(() => dailySummary(state.transactions, from, to), [state.transactions, from, to])

  async function exportPdf() {
    setPdfBusy(true)
    setPdfError('')
    try {
      const balances = customerBalances(state.transactions)
      const people = live(state.customers)
        .map((c) => ({ name: c.name, balance: balances[c.id] || 0 }))
        .filter((c) => c.balance !== 0)
        .sort((a, b) => b.balance - a.balance)
      const blob = await api.summaryPdf({
        shop: state.settings,
        period: monthLabel(month, 'en'),
        days: days.map(({ date, received, given }) => ({ date, received, given })),
        balances: people,
      })
      await deliverPdf(blob, `khata-summary-${month}.pdf`, { share: true })
    } catch {
      setPdfError(t('bill.pdfFailed'))
    }
    setPdfBusy(false)
  }

  return (
    <>
      <Seo
        {...ROUTE_META['/summary']}
      />
      <h1 className="mb-1 text-xl font-bold">{t('sum.title')}</h1>
      <p className="mb-4 text-sm text-gray-600">{t('sum.intro')}</p>

      <div className="mb-4 flex items-center justify-between gap-2">
        <button type="button" className="btn-icon bg-white shadow-sm ring-1 ring-black/5" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label={t('sum.prevMonth')}>
          ‹
        </button>
        <p className="text-center font-semibold" data-testid="summary-month">
          {monthLabel(month, lang)}
        </p>
        <button
          type="button"
          className={`btn-icon bg-white shadow-sm ring-1 ring-black/5 ${month >= currentMonth ? 'pointer-events-none opacity-40' : ''}`}
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          aria-label={t('sum.nextMonth')}
          aria-disabled={month >= currentMonth}
          tabIndex={month >= currentMonth ? -1 : undefined}
        >
          ›
        </button>
      </div>

      <section className="grid grid-cols-3 gap-2" aria-label={t('sum.totals')}>
        <Total label={t('sum.in')} value={totals.received} tone="text-khata" />
        <Total label={t('sum.out')} value={totals.given} tone="text-red-600" />
        <Total label={t('sum.net')} value={totals.net} tone={totals.net >= 0 ? 'text-khata' : 'text-red-600'} />
      </section>
      {days.length > 0 && (
        <p className={`mt-2 text-center text-sm font-medium ${totals.net >= 0 ? 'text-khata-dark' : 'text-red-700'}`}>
          {totals.net >= 0 ? '📈 ' + t('sum.netUp') : '📉 ' + t('sum.netDown')}
        </p>
      )}

      <section className="card mt-4 overflow-x-auto p-0">
        {days.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-600">{t('sum.empty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-khata text-left text-white">
                <th className="px-3 py-2 font-semibold">{t('sum.date')}</th>
                <th className="px-3 py-2 text-right font-semibold">{t('sum.in')}</th>
                <th className="px-3 py-2 text-right font-semibold">{t('sum.out')}</th>
                <th className="px-3 py-2 text-right font-semibold">{t('sum.net')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {days.map((d) => (
                <tr key={d.date} className="odd:bg-white even:bg-emerald-50/50">
                  <td className="whitespace-nowrap px-3 py-2">{formatDate(d.date, lang)}</td>
                  <td className="px-3 py-2 text-right text-khata">{d.received ? formatINR(d.received) : '—'}</td>
                  <td className="px-3 py-2 text-right text-red-600">{d.given ? formatINR(d.given) : '—'}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${d.net >= 0 ? 'text-khata-dark' : 'text-red-700'}`}>{formatINR(d.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-khata/30 bg-emerald-50 font-bold">
                <td className="px-3 py-2">{t('sum.totals')}</td>
                <td className="px-3 py-2 text-right text-khata">{formatINR(totals.received)}</td>
                <td className="px-3 py-2 text-right text-red-600">{formatINR(totals.given)}</td>
                <td className={`px-3 py-2 text-right ${totals.net >= 0 ? 'text-khata-dark' : 'text-red-700'}`}>{formatINR(totals.net)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      <div className="no-print mt-4">
        <button type="button" className="btn-primary w-full" onClick={exportPdf} disabled={pdfBusy || days.length === 0}>
          📄 {pdfBusy ? '…' : t('sum.pdf')}
        </button>
        {pdfError && <p className="mt-2 text-center text-sm text-red-600">{pdfError}</p>}
        <p className="mt-2 text-center text-xs text-gray-500">{t('sum.pdfHint')}</p>
      </div>
    </>
  )
}
