import { useCallback, useEffect, useRef, useState } from 'react'
import GoogleSignIn from '../components/GoogleSignIn'
import Seo from '../components/Seo'
import { api } from '../lib/api'
import { isValidGSTIN } from '../lib/gst'
import { useT } from '../lib/i18n'
import { downloadBackup } from '../lib/storage'
import { isValidUpi } from '../lib/whatsapp'
import { useKhata } from '../state/KhataContext'

const FIELDS = [
  { key: 'shopName', label: 'settings.shopName', max: 80 },
  { key: 'shopPhone', label: 'settings.shopPhone', type: 'tel', max: 16 },
  { key: 'address', label: 'settings.address', max: 160 },
  { key: 'gstin', label: 'settings.gstin', max: 15 },
  { key: 'upiId', label: 'settings.upi', hint: 'settings.upiHint', max: 60 },
]

const readText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })

export default function Settings() {
  const { t, lang, setLang } = useT()
  const { state, saveSettings, auth, signIn, signOut, sync, syncNow, importBackup } = useKhata()
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.key, state.settings[f.key] || ''])))
  const [message, setMessage] = useState(null)
  const [clientId, setClientId] = useState(undefined)
  const fileInput = useRef(null)

  useEffect(() => {
    let active = true
    api.config().then(
      (c) => active && setClientId(c.googleClientId || null),
      () => active && setClientId(null),
    )
    return () => {
      active = false
    }
  }, [])

  function save(e) {
    e.preventDefault()
    const gstin = form.gstin.trim().toUpperCase()
    if (gstin && !isValidGSTIN(gstin)) return setMessage({ tone: 'error', text: t('settings.invalidGstin') })
    if (form.upiId.trim() && !isValidUpi(form.upiId)) return setMessage({ tone: 'error', text: t('settings.invalidUpi') })
    saveSettings({ ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])), gstin })
    setMessage({ tone: 'ok', text: t('settings.saved') })
  }

  const onCredential = useCallback(
    (credential) => signIn(credential).catch((e) => setMessage({ tone: 'error', text: e.message })),
    [signIn],
  )

  async function restore(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const doc = JSON.parse(await readText(file))
      if (doc.app !== 'doaide-khata' || !Array.isArray(doc.customers)) throw new Error('bad file')
      importBackup(doc)
      setMessage({ tone: 'ok', text: t('settings.importDone') })
    } catch {
      setMessage({ tone: 'error', text: t('settings.importFailed') })
    }
  }

  return (
    <>
      <Seo
        title="Settings — Shop details, UPI & backup | DoAide Khata"
        description="Set your shop name, GSTIN and UPI ID for payment reminders and bills. Back up your khata or sign in with Google to sync across phones."
        path="/settings"
      />
      <h1 className="mb-4 text-2xl font-bold">{t('settings.title')}</h1>

      <form className="card space-y-4" onSubmit={save} noValidate>
        <h2 className="font-semibold">{t('settings.shop')}</h2>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="label" htmlFor={`settings-${f.key}`}>
              {t(f.label)}
            </label>
            <input
              id={`settings-${f.key}`}
              className="input"
              type={f.type || 'text'}
              value={form[f.key]}
              maxLength={f.max}
              placeholder={f.hint ? t(f.hint) : undefined}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        {message && (
          <p role="status" className={`text-sm ${message.tone === 'error' ? 'text-red-600' : 'text-khata'}`}>
            {message.text}
          </p>
        )}
        <button type="submit" className="btn-primary w-full">
          {t('settings.save')}
        </button>
      </form>

      <section className="card mt-4">
        <h2 className="mb-3 font-semibold">{t('settings.language')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['en', 'English'],
            ['hi', 'हिंदी'],
          ].map(([code, label]) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={`btn border-2 ${lang === code ? 'border-khata bg-emerald-50 text-khata-dark' : 'border-gray-200 bg-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card mt-4 space-y-3">
        <h2 className="font-semibold">{t('settings.sync')}</h2>
        {auth ? (
          <>
            <p className="text-sm text-gray-700">{t('settings.signedIn', { email: auth.email })}</p>
            {sync.status === 'error' && <p className="text-sm text-amber-700">{t('sync.error')}</p>}
            {sync.lastSync && <p className="text-xs text-gray-500">{t('settings.lastSync', { time: sync.lastSync.toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' }) })}</p>}
            <div className="flex gap-3">
              <button type="button" className="btn-primary flex-1" onClick={syncNow} disabled={sync.status === 'syncing'}>
                {sync.status === 'syncing' ? t('settings.syncing') : t('settings.syncNow')}
              </button>
              <button type="button" className="btn-ghost flex-1" onClick={signOut}>
                {t('settings.signOut')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">{t('localNote')}</p>
            {clientId ? (
              <GoogleSignIn clientId={clientId} onCredential={onCredential} locale={lang} />
            ) : (
              clientId === null && <p className="text-xs text-gray-500">{t('settings.ssoOff')}</p>
            )}
          </>
        )}
        <div className="flex gap-3 border-t border-gray-100 pt-3">
          <button type="button" className="btn-ghost flex-1 text-sm" onClick={() => downloadBackup(state)}>
            ⬇️ {t('settings.export')}
          </button>
          <button type="button" className="btn-ghost flex-1 text-sm" onClick={() => fileInput.current?.click()}>
            ⬆️ {t('settings.import')}
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={restore} data-testid="restore-input" />
        </div>
      </section>
    </>
  )
}
