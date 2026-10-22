import { useState } from 'react'
import { useT } from '../lib/i18n'
import { isValidIndianMobile } from '../lib/whatsapp'

// `withOpening` adds an optional first-udhar field so a new customer and their
// existing balance can be saved in one step.
export default function CustomerForm({ initial = {}, withOpening = false, onSubmit, onCancel }) {
  const { t } = useT()
  const [name, setName] = useState(initial.name || '')
  const [phone, setPhone] = useState(initial.phone || '')
  const [opening, setOpening] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return setError(t('customer.nameRequired'))
    if (phone.trim() && !isValidIndianMobile(phone)) return setError(t('customer.invalidPhone'))
    const amount = Number(opening)
    if (opening !== '' && !(amount > 0)) return setError(t('tx.invalidAmount'))
    onSubmit({ name: name.trim(), phone: phone.trim(), ...(amount > 0 && { opening: Math.round(amount * 100) / 100 }) })
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="customer-name">
          {t('customer.name')}
        </label>
        <input id="customer-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={60} />
      </div>
      <div>
        <label className="label" htmlFor="customer-phone">
          {t('customer.phone')}
        </label>
        <input
          id="customer-phone"
          className="input"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98765 43210"
          maxLength={16}
        />
        <p className="mt-1 text-xs text-gray-500">{t('customer.phoneHint')}</p>
      </div>
      {withOpening && (
        <div>
          <label className="label" htmlFor="customer-opening">
            {t('customer.opening')}
          </label>
          <input
            id="customer-opening"
            className="input text-lg font-semibold"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            placeholder="0"
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
          {t('tx.cancel')}
        </button>
        <button type="submit" className="btn-primary flex-1">
          {t('tx.save')}
        </button>
      </div>
    </form>
  )
}
