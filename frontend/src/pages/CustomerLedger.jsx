import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackLink from '../components/BackLink'
import Balance from '../components/Balance'
import CustomerForm from '../components/CustomerForm'
import Modal from '../components/Modal'
import Seo from '../components/Seo'
import TransactionForm from '../components/TransactionForm'
import { api, deliverPdf } from '../lib/api'
import { formatDate, formatINR, initials, todayISO } from '../lib/format'
import { useT } from '../lib/i18n'
import { runningLedger } from '../lib/ledger'
import { entryMessage, reminderMessage, whatsappLink } from '../lib/whatsapp'
import { useKhata } from '../state/KhataContext'

export default function CustomerLedger() {
  const { id } = useParams()
  const { t, lang } = useT()
  const navigate = useNavigate()
  const { state, addTransaction, updateTransaction, deleteTransaction, updateCustomer, deleteCustomer } = useKhata()
  const [form, setForm] = useState(null) // {type} for new, {tx} for edit
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [pdfBusy, setPdfBusy] = useState(false)
  const [savedId, setSavedId] = useState(null) // last new entry, offered for sharing on WhatsApp

  const customer = state.customers.find((c) => c.id === id && !c.deleted)
  const rows = useMemo(() => runningLedger(state.transactions, id), [state.transactions, id])
  const balance = rows.length ? rows[rows.length - 1].balance : 0

  if (!customer) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-gray-600">{t('customer.notFound')}</p>
        <Link to="/" className="btn-primary">
          {t('goHome')}
        </Link>
      </div>
    )
  }

  const { settings } = state
  const reminder = whatsappLink(
    customer.phone,
    reminderMessage({ lang, customerName: customer.name, amount: balance, shopName: settings.shopName, upiId: settings.upiId }),
  )

  async function exportPdf() {
    setPdfBusy(true)
    setPdfError('')
    try {
      const blob = await api.ledgerPdf({
        shop: settings,
        customer: { name: customer.name, phone: customer.phone },
        transactions: rows.map(({ date, type, amount, note, createdAt }) => ({ date, type, amount, note, createdAt })),
      })
      await deliverPdf(blob, `khata-${customer.name.replace(/[^\wऀ-ॿ]+/g, '-')}.pdf`, { share: true })
    } catch {
      setPdfError(t('bill.pdfFailed'))
    }
    setPdfBusy(false)
  }

  function saveTx(data) {
    if (form.tx) updateTransaction(form.tx.id, { type: data.type, amount: data.amount, note: data.note, date: data.date })
    else setSavedId(addTransaction({ ...data, customerId: id }).id)
    setForm(null)
  }

  function removeTx() {
    if (window.confirm(t('tx.deleteConfirm'))) {
      deleteTransaction(form.tx.id)
      setForm(null)
    }
  }

  function removeCustomer() {
    if (window.confirm(t('customer.deleteConfirm', { name: customer.name }))) {
      deleteCustomer(id)
      navigate('/')
    }
  }

  const saved = savedId && rows.find((r) => r.id === savedId)
  const savedHref =
    saved &&
    whatsappLink(
      customer.phone,
      entryMessage({
        lang,
        customerName: customer.name,
        type: saved.type,
        amount: saved.amount,
        balance,
        date: formatDate(saved.date, lang),
        shopName: settings.shopName,
        upiId: settings.upiId,
      }),
    )

  let lastDate = null

  return (
    <>
      <Seo title={`${customer.name} — DoAide Khata`} description="Customer ledger" path={`/customer/${id}`} />
      <BackLink />

      <section className="card">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-khata-dark">
            {initials(customer.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">{customer.name}</h1>
            {customer.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
            {customer.email && <p className="text-xs text-gray-400">{customer.email}</p>}
            {customer.contactType === 'supplier' && (
              <span className="mt-0.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{t('customer.typeSupplier')}</span>
            )}
          </div>
          <button type="button" className="btn-icon text-gray-500 hover:bg-gray-100" onClick={() => setEditingCustomer(true)} aria-label={t('customer.edit')}>
            ✏️
          </button>
        </div>
        <div className="my-4" data-testid="ledger-balance">
          <Balance value={balance} size="lg" />
        </div>
        <div className="no-print grid grid-cols-3 gap-2">
          <a
            href={reminder}
            target="_blank"
            rel="noopener"
            className={`btn-wa px-2 text-sm ${balance > 0 ? '' : 'pointer-events-none opacity-50'}`}
            aria-disabled={balance <= 0}
            tabIndex={balance > 0 ? undefined : -1}
          >
            💬 {t('ledger.remind')}
          </a>
          <button type="button" className="btn-ghost px-2 text-sm" onClick={exportPdf} disabled={pdfBusy || rows.length === 0}>
            📄 {pdfBusy ? '…' : t('ledger.pdf')}
          </button>
          <a href={customer.phone ? `tel:${customer.phone}` : undefined} className={`btn-ghost px-2 text-sm ${customer.phone ? '' : 'pointer-events-none opacity-50'}`} aria-disabled={!customer.phone}>
            📞 {t('ledger.call')}
          </a>
        </div>
        {!customer.phone && balance > 0 && <p className="mt-2 text-center text-xs text-gray-500">{t('ledger.noPhone')}</p>}
        {pdfError && <p className="mt-2 text-center text-sm text-red-600">{pdfError}</p>}
      </section>

      {saved && (
        <section role="status" className="no-print card mt-4 border-l-4 border-khata-wa py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-khata-dark">✅ {t('ledger.saved')}</p>
            <button type="button" className="btn-icon text-gray-400" aria-label={t('close')} onClick={() => setSavedId(null)}>
              ✕
            </button>
          </div>
          <a href={savedHref} target="_blank" rel="noopener" className="btn-wa mt-2 w-full" onClick={() => setSavedId(null)}>
            💬 {t('ledger.sendEntry')}
          </a>
        </section>
      )}

      <section className="mt-4 rounded-2xl bg-khata-chat p-3" aria-label={t('ledger.label')}>
        {rows.length === 0 && <p className="py-8 text-center text-sm text-gray-600">{t('tx.empty')}</p>}
        <ul className="space-y-2">
          {rows.map((tx) => {
            const showDate = tx.date !== lastDate
            lastDate = tx.date
            const gave = tx.type === 'gave'
            return (
              <li key={tx.id}>
                {showDate && (
                  <p className="my-2 text-center">
                    <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs text-gray-600 shadow-sm">{formatDate(tx.date, lang)}</span>
                  </p>
                )}
                <div className={`flex ${gave ? 'justify-end' : 'justify-start'}`}>
                  <button
                    type="button"
                    onClick={() => setForm({ tx })}
                    className={`min-w-[45%] max-w-[80%] rounded-2xl px-3 py-2 text-left shadow-sm active:brightness-95 ${gave ? 'rounded-tr-sm bg-red-50' : 'rounded-tl-sm bg-white'}`}
                  >
                    <span className="block text-[11px] font-medium text-gray-500">{gave ? t('tx.gave') : t('tx.received')}</span>
                    <span className={`block text-lg font-bold ${gave ? 'text-red-600' : 'text-khata'}`}>{formatINR(tx.amount)}</span>
                    {tx.note && <span className="block text-sm text-gray-700">{tx.note}</span>}
                    {tx.category && <span className="mt-0.5 block text-[11px] text-gray-400">{t(`cat.${tx.category}`)}</span>}
                    {tx.dueDate && (
                      <span className={`mt-0.5 block text-[11px] font-medium ${tx.dueDate < todayISO() ? 'text-red-500' : 'text-amber-600'}`}>
                        {tx.dueDate < todayISO() ? `⚠ ${t('tx.overdue')} · ` : ''}{t('tx.due', { date: formatDate(tx.dueDate, lang) })}
                      </span>
                    )}
                    <span className="mt-0.5 block text-right text-[11px] text-gray-400">{t('tx.balanceAfter', { amount: formatINR(tx.balance) })}</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
      <div className="h-20 sm:hidden" aria-hidden />

      <div className="no-print above-nav fixed inset-x-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button type="button" className="btn min-h-[56px] flex-1 bg-red-600 text-lg text-white hover:bg-red-700" onClick={() => setForm({ type: 'gave' })}>
            {t('tx.gaveBtn')}
          </button>
          <button type="button" className="btn-primary min-h-[56px] flex-1 text-lg" onClick={() => setForm({ type: 'received' })}>
            {t('tx.receivedBtn')}
          </button>
        </div>
      </div>

      {form && (
        <Modal title={form.tx ? t('tx.edit') : customer.name} onClose={() => setForm(null)}>
          <TransactionForm initial={form.tx || { type: form.type }} onSubmit={saveTx} onCancel={() => setForm(null)} onDelete={form.tx ? removeTx : undefined} />
        </Modal>
      )}

      {editingCustomer && (
        <Modal title={t('customer.edit')} onClose={() => setEditingCustomer(false)}>
          <CustomerForm
            initial={customer}
            onSubmit={(data) => {
              updateCustomer(id, data)
              setEditingCustomer(false)
            }}
            onCancel={() => setEditingCustomer(false)}
          />
          <button type="button" className="mt-3 min-h-[44px] w-full text-sm font-medium text-red-600" onClick={removeCustomer}>
            {t('customer.delete')}
          </button>
        </Modal>
      )}
    </>
  )
}
