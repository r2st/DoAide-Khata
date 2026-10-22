import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'
import { LangProvider } from '../lib/i18n'
import { KhataProvider, emptyState } from '../state/KhataContext'

export function renderApp(path = '/', { state = emptyState, lang = 'en' } = {}) {
  return render(
    <HelmetProvider>
      <LangProvider lang={lang}>
        <KhataProvider initialState={state}>
          <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
          </MemoryRouter>
        </KhataProvider>
      </LangProvider>
    </HelmetProvider>,
  )
}

export const customer = (id, name, phone = '') => ({ id, name, phone, createdAt: 1, updatedAt: 1 })
export const tx = (id, customerId, type, amount, date, extra = {}) => ({
  id,
  customerId,
  type,
  amount,
  date,
  note: '',
  createdAt: 1,
  updatedAt: 1,
  ...extra,
})
