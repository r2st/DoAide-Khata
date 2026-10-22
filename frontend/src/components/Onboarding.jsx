import { useState } from 'react'
import { useT } from '../lib/i18n'
import { ONBOARDED_KEY, writeJSON } from '../lib/storage'
import { isValidUpi } from '../lib/whatsapp'
import { useKhata } from '../state/KhataContext'

const STEPS = [
  { icon: '👤', key: 'onb.step1' },
  { icon: '✍️', key: 'onb.step2' },
  { icon: '💬', key: 'onb.step3' },
]

// First-run guide: pick a language, see the three steps, optionally add shop
// details. `onDone(true)` means "open the add-customer form next".
export default function Onboarding({ onDone }) {
  const { t, lang, setLang } = useT()
  const { state, saveSettings } = useKhata()
  const [step, setStep] = useState(0)
  const [shopName, setShopName] = useState(state.settings.shopName || '')
  const [upiId, setUpiId] = useState(state.settings.upiId || '')
  const [error, setError] = useState('')

  function finish(addCustomer) {
    writeJSON(ONBOARDED_KEY, true)
    onDone(addCustomer)
  }

  function start() {
    if (upiId.trim() && !isValidUpi(upiId)) return setError(t('settings.invalidUpi'))
    if (shopName.trim() || upiId.trim()) saveSettings({ shopName: shopName.trim(), upiId: upiId.trim() })
    finish(true)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={t('onb.welcome')} className="fixed inset-0 z-50 overflow-y-auto bg-khata-bg">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-khata' : 'w-2 bg-emerald-200'}`} />
            ))}
          </div>
          <button type="button" className="min-h-[44px] px-3 text-sm font-semibold text-gray-500" onClick={() => finish(false)}>
            {t('onb.skip')}
          </button>
        </div>

        {step === 0 && (
          <div className="flex flex-1 flex-col justify-center text-center">
            <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-khata text-4xl font-bold text-white shadow-lg">₹</span>
            <h2 className="mb-2 text-2xl font-bold text-khata-dark">{t('onb.welcome')}</h2>
            <p className="mb-8 text-gray-600">{t('onb.free')}</p>
            <p className="mb-3 font-semibold">भाषा चुनें / Choose language</p>
            <div className="space-y-3">
              {[
                ['hi', 'हिंदी'],
                ['en', 'English'],
              ].map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => {
                    setLang(code)
                    setStep(1)
                  }}
                  className={`btn w-full border-2 py-4 text-xl ${lang === code ? 'border-khata bg-emerald-50 text-khata-dark' : 'border-gray-200 bg-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-1 flex-col">
            <h2 className="mb-5 text-2xl font-bold text-khata-dark">{t('onb.howTitle')}</h2>
            <ol className="space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.key} className="card flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl" aria-hidden>
                    {s.icon}
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-khata">{i + 1}</span>
                    <span className="block font-medium">{t(s.key)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-xl bg-white/70 p-3 text-center text-sm text-gray-600">🔒 {t('onb.free')}</p>
            <div className="mt-auto flex gap-3 pt-6">
              <button type="button" className="btn-ghost flex-1" onClick={() => setStep(0)}>
                {t('onb.back')}
              </button>
              <button type="button" className="btn-primary flex-[2] text-lg" onClick={() => setStep(2)}>
                {t('onb.next')} →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col">
            <h2 className="mb-1 text-2xl font-bold text-khata-dark">{t('onb.shopTitle')}</h2>
            <p className="mb-5 text-sm text-gray-600">{t('onb.shopHint')}</p>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="onb-shop">
                  {t('settings.shopName')}
                </label>
                <input id="onb-shop" className="input" value={shopName} maxLength={80} onChange={(e) => setShopName(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="onb-upi">
                  {t('settings.upi')}
                </label>
                <input
                  id="onb-upi"
                  className="input"
                  value={upiId}
                  maxLength={60}
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder={t('settings.upiHint')}
                  onChange={(e) => {
                    setUpiId(e.target.value)
                    setError('')
                  }}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="mt-auto flex gap-3 pt-6">
              <button type="button" className="btn-ghost flex-1" onClick={() => setStep(1)}>
                {t('onb.back')}
              </button>
              <button type="button" className="btn-primary flex-[2] text-lg" onClick={start}>
                + {t('onb.start')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
