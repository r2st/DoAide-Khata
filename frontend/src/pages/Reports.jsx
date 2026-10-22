import { useMemo, useState } from 'react'
import Seo from '../components/Seo'
import { formatINR, todayISO } from '../lib/format'
import { useT } from '../lib/i18n'
import { live, round2 } from '../lib/ledger'
import { useKhata } from '../state/KhataContext'

function monthlyData(transactions, year) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0')
    return { month: `${year}-${m}`, received: 0, given: 0 }
  })
  for (const t of live(transactions)) {
    if (!t.date || !t.date.startsWith(String(year))) continue
    const mi = Number(t.date.slice(5, 7)) - 1
    const amount = Number(t.amount) || 0
    if (t.type === 'received') months[mi].received = round2(months[mi].received + amount)
    else months[mi].given = round2(months[mi].given + amount)
  }
  return months.map((m) => ({ ...m, net: round2(m.received - m.given) }))
}

function dailyData(transactions, yearMonth) {
  const [y, mo] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(y, mo, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    return { day: `${yearMonth}-${d}`, received: 0, given: 0 }
  })
  for (const t of live(transactions)) {
    if (!t.date || !t.date.startsWith(yearMonth)) continue
    const di = Number(t.date.slice(8, 10)) - 1
    const amount = Number(t.amount) || 0
    if (t.type === 'received') days[di].received = round2(days[di].received + amount)
    else days[di].given = round2(days[di].given + amount)
  }
  return days.map((d) => ({ ...d, net: round2(d.received - d.given) }))
}

function categoryBreakdown(transactions, yearMonth) {
  const cats = {}
  for (const t of live(transactions)) {
    if (!t.date || !t.date.startsWith(yearMonth)) continue
    const cat = t.category || 'other'
    cats[cat] = round2((cats[cat] || 0) + (Number(t.amount) || 0))
  }
  return Object.entries(cats)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस']

const BAR_COLORS = { received: '#047857', given: '#dc2626' }

function BarChart({ data, labelKey, lang, height = 200 }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.received, d.given)), 1)
  const barW = Math.max(8, Math.min(24, Math.floor(600 / data.length / 2.5)))
  const gap = Math.max(2, Math.floor(barW * 0.3))
  const groupW = barW * 2 + gap
  const chartW = data.length * (groupW + gap * 2)
  const pad = { top: 20, bottom: 30, left: 10, right: 10 }
  const svgW = chartW + pad.left + pad.right
  const svgH = height + pad.top + pad.bottom

  return (
    <div className="overflow-x-auto rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="min-w-full" style={{ minWidth: Math.max(svgW, 300) }}>
        {data.map((d, i) => {
          const x = pad.left + i * (groupW + gap * 2) + gap
          const rH = (d.received / maxVal) * height
          const gH = (d.given / maxVal) * height
          const label =
            labelKey === 'month'
              ? (lang === 'hi' ? MONTH_HI : MONTH_SHORT)[Number(d.month.slice(5, 7)) - 1]
              : d.day.slice(8)
          return (
            <g key={i}>
              <rect x={x} y={pad.top + height - rH} width={barW} height={rH} rx={2} fill={BAR_COLORS.received} opacity={0.85} />
              <rect x={x + barW + gap} y={pad.top + height - gH} width={barW} height={gH} rx={2} fill={BAR_COLORS.given} opacity={0.85} />
              <text
                x={x + groupW / 2}
                y={pad.top + height + 16}
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: Math.min(10, barW) }}
              >
                {label}
              </text>
            </g>
          )
        })}
        <line x1={pad.left} y1={pad.top + height} x2={svgW - pad.right} y2={pad.top + height} stroke="#e5e7eb" strokeWidth={1} />
      </svg>
      <div className="mt-2 flex justify-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: BAR_COLORS.received }} />
          {lang === 'hi' ? 'मिले' : 'Received'}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: BAR_COLORS.given }} />
          {lang === 'hi' ? 'दिए' : 'Given'}
        </span>
      </div>
    </div>
  )
}

function DonutChart({ data, lang }) {
  if (data.length === 0) return null
  const total = data.reduce((s, d) => s + d.total, 0)
  const colors = ['#047857', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6']
  let cum = 0
  const slices = data.map((d, i) => {
    const start = cum / total
    cum += d.total
    const end = cum / total
    return { ...d, start, end, color: colors[i % colors.length] }
  })

  const cx = 80, cy = 80, r = 70, ir = 40
  function arcPath(startAngle, endAngle) {
    const s = startAngle * 2 * Math.PI - Math.PI / 2
    const e = endAngle * 2 * Math.PI - Math.PI / 2
    const large = endAngle - startAngle > 0.5 ? 1 : 0
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const x3 = cx + ir * Math.cos(e), y3 = cy + ir * Math.sin(e)
    const x4 = cx + ir * Math.cos(s), y4 = cy + ir * Math.sin(s)
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${ir},${ir} 0 ${large} 0 ${x4},${y4} Z`
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={arcPath(s.start, s.end)} fill={s.color} opacity={0.85} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 10 }}>
          {lang === 'hi' ? 'कुल' : 'Total'}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-900 font-bold" style={{ fontSize: 12 }}>
          {formatINR(total)}
        </text>
      </svg>
      <ul className="space-y-1 text-sm">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: s.color }} />
            <span className="text-gray-700">{s.name}</span>
            <span className="ml-auto font-semibold">{formatINR(s.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Reports() {
  const { t, lang } = useT()
  const { state } = useKhata()
  const currentYear = new Date().getFullYear()
  const currentMonth = todayISO().slice(0, 7)
  const [view, setView] = useState('yearly')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  const yearlyBars = useMemo(() => monthlyData(state.transactions, year), [state.transactions, year])
  const monthlyBars = useMemo(() => dailyData(state.transactions, month), [state.transactions, month])
  const catData = useMemo(
    () => categoryBreakdown(state.transactions, view === 'yearly' ? String(year) : month),
    [state.transactions, view, year, month],
  )

  const yearTotals = useMemo(() => {
    const r = yearlyBars.reduce((s, m) => s + m.received, 0)
    const g = yearlyBars.reduce((s, m) => s + m.given, 0)
    return { received: round2(r), given: round2(g), net: round2(r - g) }
  }, [yearlyBars])

  const monthTotals = useMemo(() => {
    const r = monthlyBars.reduce((s, d) => s + d.received, 0)
    const g = monthlyBars.reduce((s, d) => s + d.given, 0)
    return { received: round2(r), given: round2(g), net: round2(r - g) }
  }, [monthlyBars])

  const totals = view === 'yearly' ? yearTotals : monthTotals

  return (
    <>
      <Seo
        title={t('reports.title') + ' — DoAide Khata'}
        description="Monthly and yearly reports with charts for your shop khata. Track income, expenses, and category-wise breakdown."
        path="/reports"
      />
      <h1 className="mb-1 text-xl font-bold">{t('reports.title')}</h1>
      <p className="mb-4 text-sm text-gray-600">{t('reports.intro')}</p>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === 'yearly' ? 'bg-khata text-white' : 'bg-white text-gray-700 ring-1 ring-black/10'}`}
          onClick={() => setView('yearly')}
        >
          {t('reports.yearly')}
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === 'monthly' ? 'bg-khata text-white' : 'bg-white text-gray-700 ring-1 ring-black/10'}`}
          onClick={() => setView('monthly')}
        >
          {t('reports.monthly')}
        </button>
      </div>

      {view === 'yearly' ? (
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="btn-icon bg-white shadow-sm ring-1 ring-black/5" onClick={() => setYear((y) => y - 1)}>‹</button>
          <p className="font-semibold">{year}</p>
          <button
            type="button"
            className={`btn-icon bg-white shadow-sm ring-1 ring-black/5 ${year >= currentYear ? 'pointer-events-none opacity-40' : ''}`}
            onClick={() => setYear((y) => y + 1)}
            aria-disabled={year >= currentYear}
          >›</button>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="btn-icon bg-white shadow-sm ring-1 ring-black/5" onClick={() => {
            const [y, m] = month.split('-').map(Number)
            const d = new Date(y, m - 2, 1)
            setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }}>‹</button>
          <p className="font-semibold">
            {new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1).toLocaleDateString(
              lang === 'hi' ? 'hi-IN' : 'en-IN',
              { month: 'long', year: 'numeric' },
            )}
          </p>
          <button
            type="button"
            className={`btn-icon bg-white shadow-sm ring-1 ring-black/5 ${month >= currentMonth ? 'pointer-events-none opacity-40' : ''}`}
            onClick={() => {
              const [y, m] = month.split('-').map(Number)
              const d = new Date(y, m, 1)
              setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
            }}
            aria-disabled={month >= currentMonth}
          >›</button>
        </div>
      )}

      <section className="grid grid-cols-3 gap-2" aria-label={t('reports.totals')}>
        <div className="card p-3 text-center">
          <p className="text-xs font-medium text-gray-500">{t('sum.in')}</p>
          <p className="mt-1 text-lg font-bold text-khata">{formatINR(totals.received)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs font-medium text-gray-500">{t('sum.out')}</p>
          <p className="mt-1 text-lg font-bold text-red-600">{formatINR(totals.given)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs font-medium text-gray-500">{t('sum.net')}</p>
          <p className={`mt-1 text-lg font-bold ${totals.net >= 0 ? 'text-khata' : 'text-red-600'}`}>{formatINR(totals.net)}</p>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-600">{t('reports.chartTitle')}</h2>
        <BarChart
          data={view === 'yearly' ? yearlyBars : monthlyBars}
          labelKey={view === 'yearly' ? 'month' : 'day'}
          lang={lang}
        />
      </section>

      {catData.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-600">{t('reports.categoryTitle')}</h2>
          <div className="card">
            <DonutChart data={catData} lang={lang} />
          </div>
        </section>
      )}
    </>
  )
}
