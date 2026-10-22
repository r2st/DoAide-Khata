import { Component } from 'react'
import { translate } from '../lib/i18n'
import { downloadBackup, readJSON } from '../lib/storage'
import { DATA_KEY } from '../state/KhataContext'

// Last line of defence: a render crash must never look like lost data to a shopkeeper.
// Offers a reload and a backup download straight from localStorage.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Khata crashed', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const lang = readJSON('khata:lang', 'en') === 'hi' ? 'hi' : 'en'
    const t = (key) => translate(lang, key)
    return (
      <div role="alert" className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-2 text-4xl">😕</p>
        <h1 className="mb-2 text-xl font-bold">{t('crash.title')}</h1>
        <p className="mb-6 text-sm text-gray-600">{t('crash.body')}</p>
        <div className="flex flex-col gap-3">
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            {t('crash.reload')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => downloadBackup(readJSON(DATA_KEY, {}))}>
            ⬇️ {t('settings.export')}
          </button>
        </div>
      </div>
    )
  }
}
