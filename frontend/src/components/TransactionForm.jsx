import { useState } from 'react'
import { todayISO } from '../lib/format'
import { useT } from '../lib/i18n'

export const NEW_CUSTOMER = '__new__'
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000]

// When `customers` is passed the form shows a customer picker (quick entry);
// otherwise it's bound to the ledger it was opened from.
export default function TransactionForm({ initial = {}, customers, newCustomerName, onSubmit, onCancel, onDelete }) {
  const { t } = useT()
  const [type, setType] = useState(initial.type || 'gave')
  const [amount, setAmount] = useState(initial.amount ? String(initial.amount) : '')
  const [note, setNote] = useState(initial.note || '')
  const [date, setDate] = useState(initial.date || todayISO())
  const [customerId, setCustomerId] = useState(initial.customerId || (newCustomerName ? NEW_CUSTOMER : ''))
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!(value > 0)) return setError(t('tx.invalidAmount'))
    if (customers && !customerId) return setError(t('tx.chooseCustomer'))
    onSubmit({ type, amount: Math.round(value * 100) / 100, note, date, customerId })
  }

  const typeButton = (value, label, active) => (
    <button
      type="button"
      aria-pressed={type === value}
      onClick={() => setType(value)}
      className={`btn flex-1 border-2 ${type === value ? active : 'border-gray-200 bg-white text-gray-600'}`}
    >
      {label}
    </button>
  )

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {customers && (
        <div>
          <label className="label" htmlFor="tx-customer">
            {t('tx.customer')}
          </label>
          <select id="tx-customer" className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">{t('tx.chooseCustomer')}</option>
            {newCustomerName && <option value={NEW_CUSTOMER}>{t('tx.newCustomer', { name: newCustomerName })}</option>}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-3">
        {typeButton('gave', t('tx.gaveBtn'), 'border-red-500 bg-red-50 text-red-700')}
        {typeButton('received', t('tx.receivedBtn'), 'border-khata bg-emerald-50 text-khata-dark')}
      </div>
      <div>
        <label className="label" htmlFor="tx-amount">
          {t('tx.amount')}
        </label>
        <input
          id="tx-amount"
          className="input text-2xl font-bold"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus={!initial.amount}
          placeholder="0"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setAmount(String(n))
                setError('')
              }}
              className={`min-h-[40px] rounded-full border px-3 text-sm font-semibold ${Number(amount) === n ? 'border-khata bg-emerald-50 text-khata-dark' : 'border-gray-200 bg-white text-gray-700'}`}
            >
              ₹{n.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="tx-note">
          {t('tx.note')}
        </label>
        <input id="tx-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} />
      </div>
      <div>
        <label className="label" htmlFor="tx-date">
          {t('tx.date')}
        </label>
        <input id="tx-date" className="input" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
          {t('tx.cancel')}
        </button>
        <button type="submit" className={`btn flex-1 text-white ${type === 'gave' ? 'bg-red-600 hover:bg-red-700' : 'bg-khata hover:bg-khata-dark'}`}>
          {t('tx.save')}
        </button>
      </div>
      {onDelete && (
        <button type="button" className="min-h-[44px] w-full text-sm font-medium text-red-600" onClick={onDelete}>
          {t('tx.delete')}
        </button>
      )}
    </form>
  )
}
