import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo, { webAppLd } from '../components/Seo'
import { api, deliverPdf } from '../lib/api'
import { formatDate, formatINR, todayISO } from '../lib/format'
import { GST_RATES, computeBill, nextBillNumber } from '../lib/gst'
import { useT } from '../lib/i18n'
import { live } from '../lib/ledger'
import { upiLink, whatsappLink } from '../lib/whatsapp'
import { useKhata } from '../state/KhataContext'

const blankItem = () => ({ name: '', hsn: '', qty: '1', rate: '', gstRate: '5' })
const validItems = (items) => items.filter((i) => i.name.trim() && Number(i.qty) > 0 && Number(i.rate) >= 0 && i.rate !== '')

export function billShareText({ shop, number, date, customerName, totals, lang }) {
  const lines = [
    `${shop.shopName || 'Bill'} — ${number}`,
    `${formatDate(date, lang)}${customerName ? ` · ${customerName}` : ''}`,
    '',
    ...totals.lines.map((l) => `${l.name} × ${l.qty} = ${formatINR(l.total)}`),
    '',
    `${lang === 'hi' ? 'कुल' : 'Total'}: ${formatINR(totals.total)}`,
  ]
  const link = upiLink({ upiId: shop.upiId, payeeName: shop.shopName, amount: totals.total, note: number })
  if (link) lines.push(`${lang === 'hi' ? 'UPI से भुगतान' : 'Pay via UPI'}: ${link}`)
  return [...lines, '', '— DoAide Khata'].join('\n')
}

export default function Bill() {
  const { t, lang } = useT()
  const { state, addBill, addTransaction } = useKhata()
  const customers = live(state.customers)
  const shop = state.settings
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [items, setItems] = useState([blankItem()])
  const [interState, setInterState] = useState(false)
  const [addToKhata, setAddToKhata] = useState(true)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const number = nextBillNumber(state.bills)
  const totals = useMemo(() => computeBill(validItems(items), interState), [items, interState])
  const customer = customers.find((c) => c.id === customerId)
  const recent = live(state.bills)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const setItem = (index, patch) => setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)))

  const pdfPayload = (bill) => ({
    shop,
    customer: bill.customer,
    number: bill.number,
    date: bill.date,
    items: bill.items,
    interState: bill.interState,
  })

  async function downloadPdf(bill) {
    setBusy(true)
    try {
      const blob = await api.billPdf(pdfPayload(bill))
      await deliverPdf(blob, `${bill.number}.pdf`, { share: true })
    } catch {
      setMessage({ tone: 'error', text: t('bill.pdfFailed') })
    }
    setBusy(false)
  }

  async function save() {
    const valid = validItems(items)
    if (!valid.length) return setMessage({ tone: 'error', text: t('bill.itemRequired') })
    const bill = addBill({
      number,
      date,
      customerId: customer?.id || '',
      customer: customer ? { name: customer.name, phone: customer.phone } : {},
      items: valid.map((i) => ({ name: i.name.trim(), hsn: i.hsn.trim(), qty: Number(i.qty), rate: Number(i.rate), gstRate: Number(i.gstRate) })),
      interState,
      total: totals.total,
    })
    if (customer && addToKhata && totals.total > 0) {
      addTransaction({ customerId: customer.id, type: 'gave', amount: totals.total, note: `${t('nav.bill')} ${number}`, date })
    }
    setItems([blankItem()])
    setLastSaved(bill)
    setMessage(null)
    await downloadPdf(bill)
  }

  const shareHref = whatsappLink(
    customer?.phone,
    billShareText({ shop, number, date, customerName: customer?.name, totals, lang }),
  )
  // Saved bills carry their own items, so they can be re-shared after the form resets.
  const savedShareHref = (b) =>
    whatsappLink(
      b.customer?.phone,
      billShareText({ shop, number: b.number, date: b.date, customerName: b.customer?.name, totals: computeBill(b.items, b.interState), lang }),
    )

  return (
    <>
      <Seo
        title="Free GST Bill Maker for Shopkeepers — PDF Invoice & Receipt | DoAide Khata"
        description="Make a GST bill or cash receipt in seconds: CGST/SGST or IGST calculated automatically, download PDF, share on WhatsApp with a UPI payment link. Free, no login."
        path="/bill"
        jsonLd={[{ ...webAppLd, name: 'DoAide Khata GST Bill Maker', url: 'https://khata.doaide.com/bill' }]}
      />
      <h1 className="mb-1 text-2xl font-bold">{t('bill.title')}</h1>
      {!shop.gstin && (
        <p className="mb-3 text-sm text-amber-700">
          {t('bill.noGstin')}{' '}
          <Link to="/settings" className="font-semibold underline">
            {t('nav.settings')}
          </Link>
        </p>
      )}

      <section className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">{t('bill.number')}</span>
            <p className="input bg-gray-50 font-mono text-sm" data-testid="bill-number">
              {number}
            </p>
          </div>
          <div>
            <label className="label" htmlFor="bill-date">
              {t('tx.date')}
            </label>
            <input id="bill-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="bill-customer">
            {t('bill.customer')}
          </label>
          <select id="bill-customer" className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">{t('bill.walkIn')}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="label">{t('bill.items')}</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <fieldset key={i} className="rounded-xl border border-gray-200 p-3">
                <legend className="sr-only">
                  {t('bill.item')} {i + 1}
                </legend>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 py-2"
                    placeholder={t('bill.item')}
                    aria-label={`${t('bill.item')} ${i + 1}`}
                    value={item.name}
                    onChange={(e) => setItem(i, { name: e.target.value })}
                    maxLength={120}
                  />
                  {items.length > 1 && (
                    <button type="button" className="btn-icon text-gray-400 hover:bg-gray-100" aria-label={t('bill.remove')} onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                      ✕
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  <input className="input px-2 py-2 text-sm" placeholder={t('bill.hsn')} aria-label={`${t('bill.hsn')} ${i + 1}`} value={item.hsn} onChange={(e) => setItem(i, { hsn: e.target.value })} maxLength={12} />
                  <input className="input px-2 py-2 text-sm" type="number" inputMode="decimal" min="0" placeholder={t('bill.qty')} aria-label={`${t('bill.qty')} ${i + 1}`} value={item.qty} onChange={(e) => setItem(i, { qty: e.target.value })} />
                  <input className="input px-2 py-2 text-sm" type="number" inputMode="decimal" min="0" placeholder={t('bill.rate')} aria-label={`${t('bill.rate')} ${i + 1}`} value={item.rate} onChange={(e) => setItem(i, { rate: e.target.value })} />
                  <select className="input px-1 py-2 text-sm" aria-label={`${t('bill.gst')} ${i + 1}`} value={item.gstRate} onChange={(e) => setItem(i, { gstRate: e.target.value })}>
                    {GST_RATES.map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>
            ))}
          </div>
          <button type="button" className="btn-ghost mt-3 w-full border-dashed text-khata" onClick={() => setItems((l) => [...l, blankItem()])}>
            {t('bill.addItem')}
          </button>
        </div>

        <label className="flex min-h-[44px] items-center gap-3 text-sm">
          <input type="checkbox" checked={interState} onChange={(e) => setInterState(e.target.checked)} className="h-5 w-5 accent-khata" />
          {t('bill.interState')}
        </label>

        <dl className="space-y-1 rounded-xl bg-khata-bg p-3 text-sm" data-testid="bill-totals">
          <div className="flex justify-between">
            <dt>{t('bill.taxable')}</dt>
            <dd>{formatINR(totals.taxable)}</dd>
          </div>
          {interState ? (
            <div className="flex justify-between">
              <dt>IGST</dt>
              <dd>{formatINR(totals.igst)}</dd>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <dt>CGST</dt>
                <dd>{formatINR(totals.cgst)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>SGST</dt>
                <dd>{formatINR(totals.sgst)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-emerald-200 pt-1 text-lg font-bold text-khata-dark">
            <dt>{t('bill.total')}</dt>
            <dd>{formatINR(totals.total)}</dd>
          </div>
        </dl>

        {customer && (
          <label className="flex min-h-[44px] items-center gap-3 text-sm">
            <input type="checkbox" checked={addToKhata} onChange={(e) => setAddToKhata(e.target.checked)} className="h-5 w-5 accent-khata" />
            {t('bill.addToKhata')}
          </label>
        )}

        {lastSaved && (
          <div role="status" className="rounded-xl border-l-4 border-khata-wa bg-emerald-50 p-3">
            <p className="mb-2 font-semibold text-khata-dark">
              ✅ {t('bill.saved')} — {lastSaved.number}
            </p>
            <a href={savedShareHref(lastSaved)} target="_blank" rel="noopener" className="btn-wa w-full">
              💬 {t('bill.shareSaved')}
            </a>
          </div>
        )}

        {message && (
          <p role="alert" className={`text-sm ${message.tone === 'error' ? 'text-red-600' : 'text-khata'}`}>
            {message.text}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <a href={shareHref} target="_blank" rel="noopener" className={`btn-wa ${totals.total > 0 ? '' : 'pointer-events-none opacity-50'}`}>
            💬 {t('bill.share')}
          </a>
          <button type="button" className="btn-primary" onClick={save} disabled={busy}>
            📄 {busy ? '…' : t('bill.download')}
          </button>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="card mt-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-600">{t('bill.recent')}</h2>
          <ul className="divide-y divide-gray-100">
            {recent.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="font-mono">{b.number}</span>
                  <span className="block text-xs text-gray-500">
                    {formatDate(b.date, lang)} · {b.customer?.name || t('bill.walkIn')}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="mr-1 font-semibold">{formatINR(b.total)}</span>
                  <a
                    href={savedShareHref(b)}
                    target="_blank"
                    rel="noopener"
                    className="btn-icon bg-khata-wa/10"
                    aria-label={t('bill.shareOne', { number: b.number })}
                  >
                    💬
                  </a>
                  <button type="button" className="btn-icon text-khata hover:bg-gray-100" onClick={() => downloadPdf(b)} aria-label={`PDF ${b.number}`} disabled={busy}>
                    📄
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
