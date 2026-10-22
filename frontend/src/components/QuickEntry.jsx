import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useT } from '../lib/i18n'
import { ruleParse } from '../lib/parse'
import { live } from '../lib/ledger'
import { useKhata } from '../state/KhataContext'
import Modal from './Modal'
import TransactionForm, { NEW_CUSTOMER } from './TransactionForm'

const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

// "Ramesh ko 500 udhar diya" → prefilled transaction. Gemini on the backend parses
// the sentence; the user always confirms before anything is saved.
export default function QuickEntry() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const { state, addCustomer, addTransaction } = useKhata()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const recognition = useRef(null)
  const customers = live(state.customers)

  async function parse(sentence) {
    if (!sentence.trim()) return
    setBusy(true)
    setError('')
    const names = customers.map((c) => c.name)
    let result = null
    try {
      result = await api.parse(sentence, names)
    } catch {
      // Offline or server trouble: the on-device parser still fills in what it can.
      result = ruleParse(sentence, names)
      if (!result.amount) setError(t('quick.failed'))
    }
    setBusy(false)
    const match = result?.customer_name && customers.find((c) => c.name.toLowerCase() === result.customer_name.toLowerCase())
    setDraft({
      customerId: match?.id || '',
      newCustomerName: !match && result?.customer_name ? result.customer_name : '',
      type: result?.type || 'gave',
      amount: result?.amount || '',
      note: result?.note || '',
    })
  }

  function listen() {
    if (!Recognition) return
    if (listening) return recognition.current?.stop()
    const rec = new Recognition()
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.onresult = (e) => {
      const heard = e.results[0][0].transcript
      setText(heard)
      parse(heard)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognition.current = rec
    setListening(true)
    rec.start()
  }

  function close() {
    setDraft(null)
    setError('')
  }

  function save({ customerId, ...tx }) {
    let id = customerId
    if (id === NEW_CUSTOMER) id = addCustomer({ name: draft.newCustomerName }).id
    addTransaction({ ...tx, customerId: id })
    close()
    setText('')
    navigate(`/customer/${id}`)
  }

  return (
    <section className="card" aria-label={t('quick.title')}>
      <h2 className="mb-2 text-sm font-semibold text-gray-600">{t('quick.title')}</h2>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          parse(text)
        }}
      >
        <input
          className="input min-w-0 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={listening ? t('quick.listening') : t('quick.placeholder')}
          aria-label={t('quick.title')}
          maxLength={300}
        />
        {Recognition && (
          <button
            type="button"
            onClick={listen}
            aria-label={t('quick.listen')}
            className={`btn px-3 text-xl ${listening ? 'animate-pulse bg-red-500 text-white' : 'bg-emerald-50 text-khata'}`}
          >
            🎤
          </button>
        )}
        <button type="submit" className="btn-primary px-4" disabled={busy || !text.trim()}>
          {busy ? '…' : t('quick.go')}
        </button>
      </form>
      {busy && <p className="mt-2 text-xs text-gray-500">{t('quick.parsing')}</p>}
      {draft && (
        <Modal title={t('quick.title')} onClose={close}>
          {error && <p className="mb-3 text-sm text-amber-700">{error}</p>}
          <TransactionForm
            initial={draft}
            customers={customers}
            newCustomerName={draft.newCustomerName}
            onSubmit={save}
            onCancel={close}
          />
        </Modal>
      )}
    </section>
  )
}
