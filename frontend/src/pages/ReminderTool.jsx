import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackLink from '../components/BackLink'
import Seo, { SITE_URL } from '../components/Seo'
import { useT } from '../lib/i18n'
import { isValidIndianMobile, isValidUpi, reminderMessage, whatsappLink } from '../lib/whatsapp'
import { useKhata } from '../state/KhataContext'

// Standalone, login-free landing page: write a polite WhatsApp payment reminder with a
// UPI pay link for any customer, with no khata needed. Doubles as an SEO entry point.
export const toolLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WhatsApp Payment Reminder Message Generator',
  url: `${SITE_URL}/tools/whatsapp-reminder`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  inLanguage: ['en-IN', 'hi-IN'],
  description:
    'Free tool for shopkeepers: create a polite udhar payment reminder in Hindi or English with a UPI payment link, and send it on WhatsApp.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  publisher: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
}

export default function ReminderTool() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const { state, addCustomer, addTransaction, saveSettings } = useKhata()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    amount: '',
    shopName: state.settings.shopName || '',
    upiId: state.settings.upiId || '',
    msgLang: lang,
  })
  const [copied, setCopied] = useState(false)
  const set = (key) => (e) => {
    setCopied(false)
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const amount = Number(form.amount)
  const errors = {
    phone: form.phone && !isValidIndianMobile(form.phone) ? t('customer.invalidPhone') : '',
    upiId: form.upiId && !isValidUpi(form.upiId) ? t('settings.invalidUpi') : '',
  }
  const ready = form.name.trim() && amount > 0 && !errors.phone && !errors.upiId
  const message = ready
    ? reminderMessage({
        lang: form.msgLang,
        customerName: form.name.trim(),
        amount,
        shopName: form.shopName.trim(),
        upiId: form.upiId.trim(),
      })
    : ''

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function saveToKhata() {
    const customer = addCustomer({ name: form.name, phone: form.phone })
    addTransaction({ customerId: customer.id, type: 'gave', amount, note: t('customer.openingNote') })
    const patch = {}
    if (!state.settings.shopName && form.shopName.trim()) patch.shopName = form.shopName.trim()
    if (!state.settings.upiId && form.upiId.trim()) patch.upiId = form.upiId.trim()
    if (Object.keys(patch).length) saveSettings(patch)
    navigate(`/customer/${customer.id}`)
  }

  return (
    <>
      <Seo
        title="Free WhatsApp Payment Reminder Message Generator (Hindi & English) | DoAide Khata"
        description="Write a polite udhar payment reminder for your customer in Hindi or English, with a UPI pay link, and send it on WhatsApp in one tap. Free, no login."
        path="/tools/whatsapp-reminder"
        jsonLd={[toolLd]}
      />
      <BackLink />
      <h1 className="mb-1 text-2xl font-bold">{t('tool.title')}</h1>
      <p className="mb-4 text-sm text-gray-600">{t('tool.intro')}</p>

      <form className="card space-y-3" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="rt-name">{t('tool.customer')}</label>
            <input id="rt-name" className="input" value={form.name} onChange={set('name')} maxLength={60} autoComplete="off" />
          </div>
          <div>
            <label className="label" htmlFor="rt-amount">{t('tool.amount')}</label>
            <input id="rt-amount" className="input" type="number" inputMode="decimal" min="1" value={form.amount} onChange={set('amount')} />
          </div>
          <div>
            <label className="label" htmlFor="rt-phone">{t('customer.phone')}</label>
            <input id="rt-phone" className="input" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
            <p className={`mt-1 text-xs ${errors.phone ? 'text-red-600' : 'text-gray-500'}`}>{errors.phone || t('customer.phoneHint')}</p>
          </div>
          <div>
            <label className="label" htmlFor="rt-shop">{t('tool.shop')}</label>
            <input id="rt-shop" className="input" value={form.shopName} onChange={set('shopName')} maxLength={80} />
          </div>
          <div>
            <label className="label" htmlFor="rt-upi">{t('tool.upi')}</label>
            <input id="rt-upi" className="input" value={form.upiId} onChange={set('upiId')} placeholder="shop@upi" autoCapitalize="none" aria-invalid={!!errors.upiId} />
            {errors.upiId && <p className="mt-1 text-xs text-red-600">{errors.upiId}</p>}
          </div>
          <div>
            <label className="label" htmlFor="rt-lang">{t('tool.msgLang')}</label>
            <select id="rt-lang" className="input" value={form.msgLang} onChange={set('msgLang')}>
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </form>

      <section className="mt-4" aria-label={t('tool.preview')}>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">{t('tool.preview')}</h2>
        {message ? (
          <>
            <pre data-testid="reminder-preview" className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-none bg-khata-chat p-4 font-sans text-sm text-gray-800 shadow-sm">
              {message}
            </pre>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a href={whatsappLink(form.phone, message)} target="_blank" rel="noopener" className="btn-wa">
                💬 {t('tool.send')}
              </a>
              <button type="button" className="btn-ghost" onClick={copy}>
                {copied ? `✅ ${t('tool.copied')}` : `📋 ${t('tool.copy')}`}
              </button>
            </div>
            <div className="card mt-4 border-l-4 border-khata">
              <p className="mb-3 text-sm text-gray-700">{t('tool.saveHint')}</p>
              <button type="button" className="btn-primary w-full" onClick={saveToKhata}>
                📒 {t('tool.save')}
              </button>
            </div>
          </>
        ) : (
          <p className="card text-sm text-gray-500">{t('tool.fill')}</p>
        )}
      </section>

      <section className="mt-8 space-y-3 text-sm text-gray-700">
        <h2 className="text-lg font-bold text-gray-900">{t('tool.tipsTitle')}</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('tool.tip1')}</li>
          <li>{t('tool.tip2')}</li>
          <li>{t('tool.tip3')}</li>
        </ul>
        <p>
          <a href="/guides/whatsapp-payment-reminder-message" className="font-semibold text-khata-dark underline">
            {t('tool.guideLink')}
          </a>
        </p>
      </section>
    </>
  )
}
